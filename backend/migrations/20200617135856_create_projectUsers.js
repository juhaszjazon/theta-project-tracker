exports.up = function (knex) {
    return knex.schema.createTable('projectUsers', (table) => {
        table.increments();
        table.integer('projectId').unsigned().references('projects.id').notNullable();
        table.integer('userId').unsigned().references('users.id').notNullable();
        table.integer('costToClientPerHour').notNullable();
        table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        table.timestamp('updatedAt').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
        table.unique(['projectId', 'userId']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('projectUsers');
}; 
