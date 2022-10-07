const mapDBToModel = (data) => ({
  ...data,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

const mapAlbumToModel = (data) => ({
  ...data,
  coverUrl: data.cover_url,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

module.exports = { mapDBToModel, mapAlbumToModel };
