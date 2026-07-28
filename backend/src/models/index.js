const User = require('./User');
const Note = require('./Note'); 

User.hasMany(Note, { foreignKey: 'userId', as: 'notes', onDelete: 'CASCADE' });
Note.belongsTo(User, { foreignKey: 'userId' ,as: 'user' });

module.exports = {
  User,
  Note,
};
