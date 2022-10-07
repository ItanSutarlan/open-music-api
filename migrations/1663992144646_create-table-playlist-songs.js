exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  }, {
    constraints: {
      unique: ['playlist_id', 'song_id'],
      foreignKeys: [
        {
          columns: 'playlist_id',
          references: 'playlists',
          onDelete: 'cascade',
        },
        {
          columns: 'song_id',
          references: 'music',
          onDelete: 'cascade',
        },
      ],
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};
