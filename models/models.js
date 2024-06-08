import sequelize from '../config_db/Database.js';
import {DataTypes} from "sequelize";

const Santri =sequelize.define('santri',{
    nis:{
        type:DataTypes.STRING,
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
        type: DataTypes.STRING,
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

// ini buat nyimpan nama-nama kelas di lembaga tertentu (ada berapa kelas? apa saja?)
const kelasLembaga =sequelize.define('kelas_lembaga',{
    id:{
        type:DataTypes.BIGINT.UNSIGNED,
        autoIncrement:true,
        primaryKey:true,
        allowNull: false
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
    status_kegiatan:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    },

    bisa_terlambat:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
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
    jam_terlambat:{
        type:DataTypes.STRING,
        allowNull: false
    },
    jam_selesai:{
        type:DataTypes.STRING,
        allowNull: false
    },
    libur_perminggu:{
        type:DataTypes.ENUM("ahad","senin","selasa","rabu","kamis","jumat","sabtu","tidak_ada"),
        allowNull: false
    },
    daftar_mesin: {
        type: DataTypes.JSON,
        allowNull: true // Change this to false if you want it to be required
    },
    peserta: {
        type: DataTypes.JSON,
        allowNull: true // Change this to false if you want it to be required
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
    nis_santri:{
        type:DataTypes.STRING,
        allowNull:false
    },

    tanggal:{
        type:DataTypes.DATEONLY,
        allowNull: false
    },
    status_absensi:{
      type:DataTypes.ENUM('HADIR','ALPA','SAKIT','IZIN'),
        allowNull: false
    },
    editor:{
        type:DataTypes.STRING,
        allowNull:false
    },
    last_edit:{
        type:DataTypes.STRING,
        allowNull:false
    }


},{freezeTableName:true,timestamps:false});

const KalenderLibur =sequelize.define('kalender_libur',{
    id:{
        type:DataTypes.BIGINT.UNSIGNED,
        autoIncrement:true,
        primaryKey:true,
        allowNull: false
    },
    sudah_terlewati:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    },

    id_kegiatan_terimbas:{
        type:DataTypes.JSON,
        allowNull:false
    },

    tanggal:{
        type:DataTypes.DATEONLY,
        allowNull: false
    },
    nama_hari:{
        type:DataTypes.STRING,
        allowNull: false
    }


},{freezeTableName:true,timestamps:false});
const  Admin=sequelize.define('admin',{
    nis:{
        type:DataTypes.STRING,
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
        allowNull:false,
        unique:true
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
    },
    atribut_mesin:{
        type:DataTypes.JSON,
        allowNull:false,
        defaultValue: []

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
export {Santri,kelasSantri,Kegiatan,Absensi,Admin,KalenderLibur,kelasLembaga}