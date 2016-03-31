var pg = require('pg');

pg.defaults.ssl = true;
pg.connect('postgres://ajyxvqkfmyiggg:t6hRGYaKGRpSD5HvpZaK3B1WTd@ec2-107-22-246-250.compute-1.amazonaws.com:5432/d2qhc9861j9dj5', function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  client
    .query('SELECT table_schema,table_name FROM information_schema.tables;')
    .on('row', function(row) {
      console.log(JSON.stringify(row));
    });

   client.query('CREATE TABLE items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)')
	.on('end', function() { console.log('table created')});

	 client.query('INSERT INTO items VALUES ("aaa ooo", TRUE)')
	.on('end', function() { console.log('value inserted')});
});