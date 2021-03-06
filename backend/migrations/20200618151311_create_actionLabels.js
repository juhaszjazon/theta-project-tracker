exports.up = function (knex) {
    return knex.schema.createTable('actionLabels', (table) => {
        table.increments();
        table.integer('projectId').unsigned().references('projects.id').notNullable();
        table.string('name');
        table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        table.timestamp('updatedAt').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
        table.integer('deletedAt').defaultTo(0);
        table.unique(['projectId', 'name', 'deletedAt']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('actionLabels');
}; 
