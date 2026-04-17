import sequelize from '../config/database.js';

async function checkUsersColumns() {
  try {
    const columns = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n📋 Colonne della tabella users:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}`);
    });
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

checkUsersColumns();
