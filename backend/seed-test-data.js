const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function seedTestData() {
  console.log('🌱 Starting to seed test data...\n');

  try {
    // 1. Создаем тестового клиента
    console.log('👤 Creating test customer...');
    const salt = await bcrypt.genSalt(10);
    const customerPassword = await bcrypt.hash('customer123', salt);
    
    const customerResult = await pool.query(
      `INSERT INTO customers (first_name, last_name, email, phone, password_hash, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Иван', 'Петров', 'ivan.petrov@example.com', '+79123456789', customerPassword, 'ул. Ленина, 10, Москва']
    );
    const customerId = customerResult.lastID;
    console.log(`   ✅ Customer created: ivan.petrov@example.com (ID: ${customerId})`);

    // 2. Создаем автомобиль для клиента
    console.log('\n🚗 Creating test vehicle...');
    const vehicleResult = await pool.query(
      `INSERT INTO vehicles (customer_id, make, model, year, vin, license_plate, mileage)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customerId, 'Toyota', 'Camry', 2020, 'JT2BF28K0X0123456', 'А123ВС777', 45000]
    );
    const vehicleId = vehicleResult.lastID;
    console.log(`   ✅ Vehicle created: Toyota Camry 2020 (ID: ${vehicleId})`);

    // 3. Получаем механиков и услуги
    const mechanicsResult = await pool.query('SELECT mechanic_id, first_name, last_name FROM mechanics LIMIT 3');
    const mechanics = mechanicsResult.rows;
    
    const servicesResult = await pool.query('SELECT service_type_id, name, base_price FROM service_types LIMIT 5');
    const services = servicesResult.rows;

    console.log(`\n🔧 Found ${mechanics.length} mechanics and ${services.length} services`);

    // 4. Создаем бронирования для каждого механика
    console.log('\n📅 Creating bookings...');
    
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    const bookingsData = [
      // Для первого механика (Maria Garcia) - разные статусы
      {
        mechanicId: mechanics[0].mechanic_id,
        mechanicName: `${mechanics[0].first_name} ${mechanics[0].last_name}`,
        date: today,
        time: '10:00',
        status: 'scheduled',
        service: services[0]
      },
      {
        mechanicId: mechanics[0].mechanic_id,
        mechanicName: `${mechanics[0].first_name} ${mechanics[0].last_name}`,
        date: today,
        time: '14:00',
        status: 'in_progress',
        service: services[1]
      },
      {
        mechanicId: mechanics[0].mechanic_id,
        mechanicName: `${mechanics[0].first_name} ${mechanics[0].last_name}`,
        date: yesterday(),
        time: '11:00',
        status: 'completed',
        service: services[2]
      },
      // Для второго механика
      {
        mechanicId: mechanics[1]?.mechanic_id,
        mechanicName: mechanics[1] ? `${mechanics[1].first_name} ${mechanics[1].last_name}` : 'N/A',
        date: tomorrow,
        time: '09:00',
        status: 'scheduled',
        service: services[3]
      },
      // Для третьего механика
      {
        mechanicId: mechanics[2]?.mechanic_id,
        mechanicName: mechanics[2] ? `${mechanics[2].first_name} ${mechanics[2].last_name}` : 'N/A',
        date: today,
        time: '15:00',
        status: 'scheduled',
        service: services[4]
      }
    ];

    const bookingIds = [];
    for (const booking of bookingsData) {
      if (!booking.mechanicId) continue;
      
      const result = await pool.query(
        `INSERT INTO bookings (customer_id, vehicle_id, mechanic_id, service_type_id, booking_date, booking_time, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [customerId, vehicleId, booking.mechanicId, booking.service.service_type_id, booking.date, booking.time, booking.status]
      );
      
      bookingIds.push(result.lastID);
      console.log(`   ✅ Booking created: ${booking.mechanicName} - ${booking.service.name} (${booking.status}) on ${booking.date} ${booking.time}`);
    }

    // 5. Создаем счет для завершенного бронирования
    console.log('\n💰 Creating invoice...');
    const completedBookingId = bookingIds[2]; // Третье бронирование (completed)
    const servicePrice = services[2].base_price;
    const taxAmount = servicePrice * 0.1; // 10% налог
    const totalAmount = servicePrice + taxAmount;
    
    const invoiceResult = await pool.query(
      `INSERT INTO invoices (booking_id, customer_id, invoice_number, subtotal, tax, total, payment_status, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [completedBookingId, customerId, `INV-${Date.now()}`, servicePrice, taxAmount, totalAmount, 'paid', 'card']
    );
    const invoiceId = invoiceResult.lastID;
    
    // Добавляем позиции в счет
    await pool.query(
      `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?)`,
      [invoiceId, services[2].name, 1, services[2].base_price, services[2].base_price]
    );
    
    console.log(`   ✅ Invoice created for completed booking (ID: ${invoiceId}, Amount: $${totalAmount.toFixed(2)})`);

    // 6. Создаем отзыв для завершенного бронирования
    console.log('\n⭐ Creating feedback...');
    await pool.query(
      `INSERT INTO feedback (booking_id, customer_id, mechanic_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [completedBookingId, customerId, mechanics[0].mechanic_id, 5, 'Отличная работа! Машина работает идеально. Быстро и качественно. Рекомендую!']
    );
    console.log(`   ✅ Feedback created: 5 stars for ${mechanics[0].first_name} ${mechanics[0].last_name}`);

    // 7. Создаем еще одного клиента для разнообразия
    console.log('\n👤 Creating second customer...');
    const customer2Password = await bcrypt.hash('customer123', salt);
    const customer2Result = await pool.query(
      `INSERT INTO customers (first_name, last_name, email, phone, password_hash, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Мария', 'Сидорова', 'maria.sidorova@example.com', '+79987654321', customer2Password, 'пр. Победы, 25, Санкт-Петербург']
    );
    const customer2Id = customer2Result.lastID;
    console.log(`   ✅ Customer created: maria.sidorova@example.com (ID: ${customer2Id})`);

    // 8. Создаем автомобиль для второго клиента
    console.log('\n🚗 Creating second vehicle...');
    const vehicle2Result = await pool.query(
      `INSERT INTO vehicles (customer_id, make, model, year, vin, license_plate, mileage)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer2Id, 'Honda', 'Civic', 2019, 'JHMFC36509S012345', 'В456ЕК199', 38000]
    );
    const vehicle2Id = vehicle2Result.lastID;
    console.log(`   ✅ Vehicle created: Honda Civic 2019 (ID: ${vehicle2Id})`);

    // 9. Создаем бронирование для второго клиента
    console.log('\n📅 Creating booking for second customer...');
    await pool.query(
      `INSERT INTO bookings (customer_id, vehicle_id, mechanic_id, service_type_id, booking_date, booking_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer2Id, vehicle2Id, mechanics[0].mechanic_id, services[0].service_type_id, tomorrow, '11:00', 'scheduled']
    );
    console.log(`   ✅ Booking created for Maria Sidorova`);

    // Финальная статистика
    console.log('\n' + '='.repeat(60));
    console.log('✨ TEST DATA SEEDED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   • Customers: 2`);
    console.log(`   • Vehicles: 2`);
    console.log(`   • Bookings: ${bookingIds.length + 1}`);
    console.log(`   • Invoices: 1`);
    console.log(`   • Feedback: 1`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Customer 1: ivan.petrov@example.com / customer123');
    console.log('   Customer 2: maria.sidorova@example.com / customer123');
    console.log('   Mechanic:   maria.garcia@garage.com / mechanic123');
    console.log('\n📝 Workflow to test:');
    console.log('   1. Login as mechanic Maria Garcia');
    console.log('   2. See bookings (scheduled, in_progress, completed)');
    console.log('   3. Change status: scheduled → in_progress → completed');
    console.log('   4. Login as customer Ivan Petrov');
    console.log('   5. Leave feedback for completed booking');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

function yesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

// Запуск
seedTestData()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
