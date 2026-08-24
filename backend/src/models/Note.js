const{DataTypes}=require('sequelize');
const sequelize = require('../config/database');    

const Note = sequelize.define(
  'Note',
  {
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },  

    userId: {
      type: DataTypes.UUID,
      allowNull: false, 
    },
    },
    {
        tableName: 'notes',
        timestamps: true,
    }
);  

module.exports = Note;