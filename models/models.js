import sequelize from '../config_db/Database.js';
import {DataTypes} from "sequelize";

const Santri =sequelize.define('santri',{
    nis:{
        type:DataTypes.BIGINT.UNSIGNED,
        primaryKey:true,
        allowNull:false
    },
    rfid:{
        type:DataTypes.STRING,
        allowNull: false
    },
    nama_santri:{
        type: DataTypes.STRING,
        allowNull: false
    },
    gender:{
        type: DataTypes.ENUM('L','P'),
        allowNull:false
    },
    is_pondok:{
      type:DataTypes.BOOLEAN,
        allowNull:false
    },
    is_sdi:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    is_mts:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    is_ma:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    is_madin:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    }

},{freezeTableName:true,timestamps:false});

const kelasSantri =sequelize.define('kelas_santri',{
    id:{
        type:DataTypes.BIGINT.UNSIGNED,
        autoIncrement:true,
        primaryKey:true,
        allowNull: false
    },
    nis_santri:{
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull:false
    },
    kelas:{
        type:DataTypes.STRING,
        allowNull: false
    },
    pemilik:{
        type:DataTypes.STRING,
        allowNull: false
    },
    tahun_ajaran:{
        type:DataTypes.STRING,
        allowNull: false
    }


},{freezeTableName:true,timestamps:false});

const  Kegiatan=sequelize.define('kegiatan',{
    id:{
        type:DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey:true,
        allowNull: false
    },
    nama_kegiatan:{
        type: DataTypes.STRING,
        allowNull: false
    },
    pemilik:{
        type:DataTypes.STRING,
        allowNull: false
    },
    jam_mulai:{
        type:DataTypes.STRING,
        allowNull: false
    },
    jam_selesai:{
        type:DataTypes.STRING,
        allowNull: false
    }



},{freezeTableName:true,timestamps:false});
const Absensi =sequelize.define('absensi',{
    id:{
        type:DataTypes.BIGINT.UNSIGNED,
        autoIncrement:true,
        primaryKey:true,
        allowNull: false
    },
    id_kegiatan:{
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    tanggal:{
        type:DataTypes.DATE,
        allowNull: false
    },
    status_absensi:{
      type:DataTypes.ENUM('HADIR','ALPHA','SAKIT','IZIN'),
        allowNull: false
    },
    is_libur:{
        type:DataTypes.BOOLEAN,
        allowNull: false
    }




},{freezeTableName:true,timestamps:false});
const  Admin=sequelize.define('admin',{
    nis:{
        type:DataTypes.BIGINT.UNSIGNED,
        primaryKey:true,
        allowNull:false
    },
    rfid:{
        type:DataTypes.STRING,
        allowNull: false
    },
    nama_admin:{
        type: DataTypes.STRING,
        allowNull: false
    },
    kategori:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    gender:{
        type: DataTypes.ENUM('L','P'),
        allowNull:false
    },
    nomer_hp:{
      type:DataTypes.STRING,
        allowNull:false
    },
    katasandi:{
        type:DataTypes.STRING,
        allowNull:false
    },
    is_pondok:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    is_sdi:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    is_mts:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    is_ma:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    is_madin:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    }


},{freezeTableName:true,timestamps:false});



// Synchronize semua model dengan database
async function syncModels() {
    try {
        // await sequelize.sync({force: true});
        await sequelize.sync();

        console.log("Semua model telah disinkronkan dengan database.");
    } catch (error) {
        console.error("Gagal menyinkronkan model dengan database: ", error);
    }
}

syncModels();
export {Santri,kelasSantri,Kegiatan,Absensi,Admin}