exports.up = (pgm) => {
  pgm.createTable('music', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(1000)',
      notNull: true,
    },
    year: {
      type: 'smallint',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(1000)',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(1000)',
      notNull: true,
    },
    duration: 'smallint',
    album_id: {
      type: 'VARCHAR(50)',
      references: 'albums',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('music');
};
