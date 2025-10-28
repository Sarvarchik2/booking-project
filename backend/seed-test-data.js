const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function seedTestData() {
  console.log('🌱 Starting to seed test data...\n');

  try {
    // Helper: find or create by unique key
    const findOrCreateCustomer = async ({ first_name, last_name, email, phone, password_hash, address }) => {
      const existing = await db.query('SELECT customer_id FROM customers WHERE email = $1', [email]);
      if (existing.rows.length > 0) return existing.rows[0].customer_id;
      const res = await db.run(
        `INSERT INTO customers (first_name, last_name, email, phone, password_hash, address)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING customer_id`,
        [first_name, last_name, email, phone, password_hash, address]
      );
      return res.rows[0].customer_id;
    };

    const findOrCreateVehicle = async ({ customer_id, make, model, year, vin, license_plate, mileage }) => {
      if (vin) {
        const existing = await db.query('SELECT vehicle_id FROM vehicles WHERE vin = $1', [vin]);
        if (existing.rows.length > 0) return existing.rows[0].vehicle_id;
      }
      const res = await db.run(
        `INSERT INTO vehicles (customer_id, make, model, year, vin, license_plate, mileage)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING vehicle_id`,
        [customer_id, make, model, year, vin, license_plate, mileage]
      );
      return res.rows[0].vehicle_id;
    };

    const findOrCreateBooking = async ({ customer_id, vehicle_id, mechanic_id, service_type_id, booking_date, booking_time, status }) => {
      const existing = await db.query(
        `SELECT booking_id FROM bookings WHERE customer_id=$1 AND vehicle_id=$2 AND mechanic_id=$3 AND service_type_id=$4 AND booking_date=$5 AND booking_time=$6 LIMIT 1`,
        [customer_id, vehicle_id, mechanic_id, service_type_id, booking_date, booking_time]
      );
      if (existing.rows.length > 0) return existing.rows[0].booking_id;
      const res = await db.run(
        `INSERT INTO bookings (customer_id, vehicle_id, mechanic_id, service_type_id, booking_date, booking_time, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING booking_id`,
        [customer_id, vehicle_id, mechanic_id, service_type_id, booking_date, booking_time, status]
      );
      return res.rows[0].booking_id;
    };

    const salt = await bcrypt.genSalt(10);
    const customerPassword = await bcrypt.hash('customer123', salt);

    console.log('👤 Creating or finding test customer...');
    const customerId = await findOrCreateCustomer({ first_name: 'Иван', last_name: 'Петров', email: 'ivan.petrov@example.com', phone: '+79123456789', password_hash: customerPassword, address: 'ул. Ленина, 10, Москва' });
    console.log(`   ✅ Customer ID: ${customerId}`);

    // 2. Создаем автомобиль для клиента
    console.log('\n🚗 Creating or finding test vehicle...');
    const vehicleId = await findOrCreateVehicle({ customer_id: customerId, make: 'Toyota', model: 'Camry', year: 2020, vin: 'JT2BF28K0X0123456', license_plate: 'А123ВС777', mileage: 45000 });
    console.log(`   ✅ Vehicle ID: ${vehicleId}`);

    // 3. Получаем механиков и услуги
  const mechanicsResult = await db.query('SELECT mechanic_id, first_name, last_name FROM mechanics LIMIT 3');
  const mechanics = mechanicsResult.rows;
    
  const servicesResult = await db.query('SELECT service_type_id, name, base_price FROM service_types LIMIT 5');
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
      const createdBookingId = await findOrCreateBooking({ customer_id: customerId, vehicle_id: vehicleId, mechanic_id: booking.mechanicId, service_type_id: booking.service.service_type_id, booking_date: booking.date, booking_time: booking.time, status: booking.status });
      bookingIds.push(createdBookingId);
      console.log(`   ✅ Booking ensured: ${booking.mechanicName} - ${booking.service.name} (${booking.status}) on ${booking.date} ${booking.time}`);
    }

    // 5. Создаем счет для завершенного бронирования
    console.log('\n💰 Creating invoice...');
    const completedBookingId = bookingIds[2]; // Третье бронирование (completed)
  const servicePrice = Number(services[2].base_price);
  const taxAmount = Number((servicePrice * 0.1).toFixed(2)); // 10% налог
  const totalAmount = Number((servicePrice + taxAmount).toFixed(2));
    
    // Create invoice if not already present for this booking
    const existingInvoice = await db.query('SELECT invoice_id FROM invoices WHERE booking_id = $1 LIMIT 1', [completedBookingId]);
    let invoiceId;
    if (existingInvoice.rows.length > 0) {
      invoiceId = existingInvoice.rows[0].invoice_id;
      console.log(`   ℹ️ Invoice already exists (ID: ${invoiceId})`);
    } else {
      const invoiceResult = await db.run(
        `INSERT INTO invoices (booking_id, customer_id, invoice_number, subtotal, tax, total, payment_status, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING invoice_id`,
        [completedBookingId, customerId, `INV-${Date.now()}`, servicePrice, taxAmount, totalAmount, 'paid', 'card']
      );
      invoiceId = invoiceResult.rows[0].invoice_id;
    }
    
    // Добавляем позиции в счет (если не существует)
    const existingItem = await db.query('SELECT item_id FROM invoice_items WHERE invoice_id=$1 LIMIT 1', [invoiceId]);
    if (existingItem.rows.length === 0) {
      await db.run(
        `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [invoiceId, services[2].name, 1, services[2].base_price, services[2].base_price]
      );
    }
    
    console.log(`   ✅ Invoice created for completed booking (ID: ${invoiceId}, Amount: $${totalAmount.toFixed(2)})`);

    // 6. Создаем отзыв для завершенного бронирования
    console.log('\n⭐ Creating feedback...');
    const existingFeedback = await db.query('SELECT feedback_id FROM feedback WHERE booking_id=$1 AND customer_id=$2 LIMIT 1', [completedBookingId, customerId]);
    if (existingFeedback.rows.length === 0) {
      await db.run(
        `INSERT INTO feedback (booking_id, customer_id, mechanic_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)`,
        [completedBookingId, customerId, mechanics[0].mechanic_id, 5, 'Отличная работа! Машина работает идеально. Быстро и качественно. Рекомендую!']
      );
      console.log(`   ✅ Feedback created: 5 stars for ${mechanics[0].first_name} ${mechanics[0].last_name}`);
    } else {
      console.log('   ℹ️ Feedback already exists for completed booking');
    }

    // 7. Создаем еще одного клиента для разнообразия
    console.log('\n👤 Creating or finding second customer...');
    const customer2Password = await bcrypt.hash('customer123', salt);
    const customer2Id = await findOrCreateCustomer({ first_name: 'Мария', last_name: 'Сидорова', email: 'maria.sidorova@example.com', phone: '+79987654321', password_hash: customer2Password, address: 'пр. Победы, 25, Санкт-Петербург' });
    console.log(`   ✅ Customer ID: ${customer2Id}`);

    // 8. Создаем автомобиль для второго клиента
    console.log('\n🚗 Creating or finding second vehicle...');
    const vehicle2Id = await findOrCreateVehicle({ customer_id: customer2Id, make: 'Honda', model: 'Civic', year: 2019, vin: 'JHMFC36509S012345', license_plate: 'В456ЕК199', mileage: 38000 });
    console.log(`   ✅ Vehicle ID: ${vehicle2Id}`);

    // 9. Создаем бронирование для второго клиента
    console.log('\n📅 Creating booking for second customer...');
    const mariaBookingId = await findOrCreateBooking({ customer_id: customer2Id, vehicle_id: vehicle2Id, mechanic_id: mechanics[0].mechanic_id, service_type_id: services[0].service_type_id, booking_date: tomorrow, booking_time: '11:00', status: 'scheduled' });
    console.log(`   ✅ Booking ensured for Maria Sidorova (ID: ${mariaBookingId})`);

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
