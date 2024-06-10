import {Absensi, Admin, KalenderLibur, Kegiatan, kelasLembaga, kelasSantri, Santri} from "./models/models.js";
import {Op} from "sequelize";
import moment from 'moment-timezone';


const tahunAjaran = {
    'SDI': '2023-2024',
    'Mts': '2023-2024',
    'MA': '2023-2024',
    'Madin': '2023-2024',
    'Pondok': '1445-1446'
};

const keteranganKehadiranMap = {
    'HADIR': '·',
    'ALPA': 'A',
    'SAKIT': 'S',
    'IZIN': 'I',
    'null': '-'
};

export async function updateStatusAbsensiPerbulan() {
    const startDate = moment.tz('Asia/Jakarta').startOf('day');

    for (let i = 0; i < 30; i++) {
        const currentDate = startDate.clone().add(i, 'days');
        await updateStatusAbsensiPerhari(currentDate);
    }
}

export async function updateStatusAbsensiPerhari(date) {
    const hariIndonesia = ['ahad', 'senin', 'selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const nama_hari_ini = hariIndonesia[date.day()].toLowerCase();

    const dateTimeWithTimezone = moment.tz(date, 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const localDate = moment.tz(date, 'Asia/Jakarta').format('YYYY-MM-DD');
    console.log("tanggalan");
    console.log(localDate);

    const kalenderLiburPadaHariIni = await KalenderLibur.findOne({
        where: {
            sudah_terlewati: false,
            tanggal: localDate
        }
    });

    const daftarKegiatanAktif = await Kegiatan.findAll({
        where: {
            status_kegiatan: true
        }
    });

    for (let kegiatanAktif of daftarKegiatanAktif) {
        let statusAbsensi = '';

        if (kegiatanAktif.libur_perminggu.toLowerCase() !== nama_hari_ini.toLowerCase()) {
            console.log(kegiatanAktif.nama_kegiatan);
            console.log("tidak libur perminggu");
            statusAbsensi = 'ALPA';
        } else {
            console.log(kegiatanAktif.nama_kegiatan);
            console.log("libur!");
            statusAbsensi = 'LIBUR';
        }

        if (kalenderLiburPadaHariIni) {
            if (kalenderLiburPadaHariIni.dataValues.id_kegiatan_terimbas.includes(kegiatanAktif.id)) {
                statusAbsensi = 'LIBUR';
            }
        }

        for (let kelas of kegiatanAktif.peserta) {
            const pesertaKegiatan = await kelasSantri.findAll({
                where: {
                    kelas: kelas.Kelas,
                    tahun_ajaran: tahunAjaran[kegiatanAktif.pemilik]
                }
            });

            for (const peserta of pesertaKegiatan) {
                const [absensi, created] = await Absensi.findOrCreate({
                    where: {
                        id_kegiatan: kegiatanAktif.id,
                        nis_santri: peserta.nis_santri,
                        tanggal: localDate
                    },
                    defaults: {
                        editor: '0',
                        status_absensi: statusAbsensi,
                        last_edit: dateTimeWithTimezone
                    }
                });

                if (!created) {
                    await absensi.update({
                        editor: '0',
                        status_absensi: statusAbsensi,
                        last_edit: dateTimeWithTimezone
                    });
                }
            }
        }
    }
}



export async function updateStatusAbsensi() {
    const hariIndonesia = ['ahad', 'senin', 'selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const today = new Date();
    const nama_hari_ini = hariIndonesia[today.getDay()].toLowerCase();

    const dateTimeWithTimezone = moment.tz(today, 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const localDate = moment.tz(today, 'Asia/Jakarta').format('YYYY-MM-DD');
    console.log("tanggalan")
    console.log(localDate)

    const kalenderLiburPadaHariIni = await KalenderLibur.findOne({
        where:{
            sudah_terlewati:false,
            tanggal:localDate
        }
    })

    const daftarKegiatanAktif = await Kegiatan.findAll({
        where: {
            status_kegiatan: true
        }
    });

    for (let kegiatanAktif of daftarKegiatanAktif) {
        let statusAbsensi = ''

        if (kegiatanAktif.libur_perminggu.toLowerCase() !== nama_hari_ini.toLowerCase()) {
            console.log(kegiatanAktif.nama_kegiatan);
            console.log("tidak libur perminggu");
            statusAbsensi = 'ALPA'

        } else {
            console.log(kegiatanAktif.nama_kegiatan);
            console.log("libur!");
            statusAbsensi='LIBUR'
        }

        if (kalenderLiburPadaHariIni){
            if (kalenderLiburPadaHariIni.dataValues.id_kegiatan_terimbas.includes(kegiatanAktif.id))
                statusAbsensi='LIBUR'
        }


                for (let kelas of kegiatanAktif.peserta) {
                    const pesertaKegiatan = await kelasSantri.findAll({
                        where: {
                            kelas: kelas.Kelas,
                            tahun_ajaran: tahunAjaran[kegiatanAktif.pemilik]
                        }
                    });

                    for (const peserta of pesertaKegiatan) {
                        const [absensi, created] = await Absensi.findOrCreate({
                            where: {
                                id_kegiatan: kegiatanAktif.id,
                                nis_santri: peserta.nis_santri,
                                tanggal: localDate
                            },
                            defaults: {
                                editor: '0',
                                status_absensi: statusAbsensi,
                                last_edit: dateTimeWithTimezone
                            }
                        });

                        if (!created) {
                            await absensi.update({
                                editor: '0',
                                status_absensi: statusAbsensi,
                                last_edit: dateTimeWithTimezone
                            });
                        }
                    }
                }





    }
}





export class Controller {

     static async rekapAbsensi (req, res) {
         try {
             const { id_kegiatan, nama_kelas, tahun_ajaran } = req.body;
             const dataKegiatan = await  Kegiatan.findByPk(id_kegiatan)
             const tanggal_mulai ="01-06-2024"
             const  tanggal_sampai="30-06-2024"
             console.log(req.body)

             // Step 1: Collect all relevant students
             const collectedStudents = await kelasSantri.findAll({
                 where: {
                     kelas: nama_kelas,
                     pemilik: dataKegiatan.dataValues.pemilik,
                     tahun_ajaran: tahun_ajaran
                 }
             });

             // Step 2: Initialize an empty array for the response
             const response = [];

             // Step 3: Iterate over each student
             for (const student of collectedStudents) {
                 const nis_santri = student.nis_santri;
                 const datSantri = await Santri.findByPk(nis_santri)
                 const attendanceData = {};
                 let totalHadir = 0;
                 let totalAlpa = 0;
                 let totalSakit = 0;
                 let totalIzin = 0;

                 // Step 4: Define the start and end dates
                 let currentDate = moment(tanggal_mulai, 'DD-MM-YYYY');
                 const endDate = moment(tanggal_sampai, 'DD-MM-YYYY');
                 let dayCounter = 1;

                 // Step 5: Loop through each day in the date range
                 while (currentDate.isSameOrBefore(endDate)) {
                     const absensi = await Absensi.findOne({
                         where: {
                             nis_santri: nis_santri,
                             id_kegiatan: id_kegiatan,
                             tanggal: currentDate.format('YYYY-MM-DD')
                         }
                     });

                     // Step 6: Record attendance status or mark it as "-"
                     if (absensi) {
                         attendanceData[`day${dayCounter}`] = absensi.status_absensi;

                         // Increment the corresponding counter
                         if (absensi.status_absensi === 'HADIR') {
                             totalHadir++;
                         } else if (absensi.status_absensi === 'ALPA') {
                             totalAlpa++;
                         } else if (absensi.status_absensi === 'SAKIT') {
                             totalSakit++;
                         } else if (absensi.status_absensi === 'IZIN') {
                             totalIzin++;
                         }
                     } else {
                         attendanceData[`day${dayCounter}`] = "-";
                     }

                     // Step 7: Move to the next day
                     currentDate = currentDate.add(1, 'days');
                     dayCounter++;
                 }

                 // Step 8: Add the student's data to the response array
                 response.push({
                     santri: datSantri.dataValues,
                     attendance_data: attendanceData,
                     totalHadir: totalHadir,
                     totalAlpa: totalAlpa,
                     totalSakit: totalSakit,
                     totalIzin: totalIzin
                 });
             }

             // Step 9: Send the response as JSON
             res.json(response);
         } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }




    static async createOneSantri(req, res){
        try {
            const { nis,rfid, nama_santri,gender, is_pondok, is_sdi,is_mts,is_ma,is_madin } = req.body;
            const santri = await Santri.create({ nis,rfid, nama_santri,gender, is_pondok, is_sdi,is_mts,is_ma,is_madin });
            res.status(201).json(santri);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // static async createManySantri(req, res){
    //     try {
    //         const santriArray = req.body;
    //         // Memastikan bahwa request adalah array
    //         if (!Array.isArray(santriArray)) {
    //             return res.status(400).json({ message: 'Input harus berupa array' });
    //         }
    //
    //         // Menambahkan semua murid ke dalam database
    //         const created_santris = await Santri.bulkCreate(santriArray, { validate: true });
    //
    //         res.status(201).json(created_santris);
    //     } catch (error) {
    //         res.status(400).json({ error: error.message });
    //     }
    // }
    static async createManySantri(req, res){
        try {
            // Retrieve the array of santri data from the request body
            const santrisData = req.body;
            // console.log(santrisData)


            // Iterate over each santri object in the array
            for (const data of santrisData) {
                console.log(data.nis)
                // Check if a santri with the specified nis already exists in the database
                const existingSantri = await Santri.findOne({where:{nis:data.nis}});
                // console.log("babi")


                // If the santri doesn't exist, create a new record
                if (!existingSantri) {
                    await Santri.create(data);
                } else {
                    console.log("celeng")
                    // If the santri exists, update the existing record with the new data
                    await Santri.update(data, { where: { nis: data.nis } });
                }

                // Define the list of institutions to check for each santri
                const institutions = ['is_sdi', 'is_mts', 'is_ma', 'is_madin'];
                // Calculate the tahun_ajaran based on the current year
                const currentYear = new Date().getFullYear();
                const tahun_ajaran = `${currentYear - 1}-${currentYear}`;

                // Process each institution flag in the santri data
                for (const institution of institutions) {
                    // Check if the santri is associated with the current institution
                    if (data[institution]) {
                        // Construct the kelas field name based on the institution
                        const kelasField = `kelas_${institution.split('_')[1]}`; // e.g., kelas_sdi
                        const pemilikField = `${institution.split('_')[1]}`; // e.g., sdi

                        // Prepare the kelasSantri data for creation or update
                        const kelasData = {
                            nis_santri: data.nis,
                            kelas: data[kelasField],
                            pemilik: pemilikField,
                            tahun_ajaran: tahun_ajaran
                        };
                        console.log("babi")
                        console.log(kelasData)
                        console.log(pemilikField)

                        // Check if a kelasSantri record already exists for the santri and institution
                        const existingKelas = await kelasSantri.findOne({
                            where: {
                                nis_santri: data.nis,
                                pemilik: pemilikField
                            }
                        });

                        // If the kelasSantri record doesn't exist, create a new one
                        if (!existingKelas) {
                            await kelasSantri.create(kelasData);
                        } else {
                            // If the record exists, update it with the new data
                            await kelasSantri.update(kelasData, {
                                where: {
                                    nis_santri: data.nis,
                                    pemilik: pemilikField
                                }
                            });
                        }
                    }
                }
            }

            // ini unutk membuat nama-nama kelas yang unik satu dengan yang lainya!


            // Find unique combinations of kelas, pemilik, tahun_ajaran in kelasSantri
            const uniqueCombinations = await kelasSantri.findAll({
                attributes: ['kelas', 'pemilik', 'tahun_ajaran'],
                group: ['kelas', 'pemilik', 'tahun_ajaran']
            });

            // Iterate over each unique combination found
            for (const combination of uniqueCombinations) {
                const { kelas, pemilik, tahun_ajaran } = combination;

                // Check if this combination already exists in kelasLembaga
                const existsInLembaga = await kelasLembaga.findOne({
                    where: { kelas, pemilik, tahun_ajaran }
                });

                // If not exists, create in kelasLembaga
                if (!existsInLembaga) {
                    await kelasLembaga.create({ kelas, pemilik, tahun_ajaran });
                }
            }


            // Send a success response after processing all santri data
            res.status(200).json({ message: 'Batch processing of santris completed. dan nama kelas lembaga telah dibuat' });
        } catch (error) {
            // Send an error response if any exception occurs
            res.status(500).json({ error: error.message });
        }
    }

    static async findAllsantri(req, res){
        try {
            console.log(req.body.merge)
            const santris = await Santri.findAll();
            res.status(201).json(santris);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async findOneSantri(req, res){
        try {
            const nis = req.params.nis;
            // console.log(nis)
            const santri = await Santri.findByPk(nis);
            if (santri) {
                res.status(200).json(santri);
            } else {
                res.status(404).json({ message: 'Santri not found' });
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async updateOneSantri(req, res){
        try {
            const updated = await Santri.update(req.body, {
                where: { nis: req.params.nis }
            });
            if (updated[0] > 0) {
                res.status(200).send('Santri updated!');
            } else {
                res.status(404).send('Santri not found');
            }
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    static async createOneKelasSantri (req, res){
        try {
            const kelas = await kelasSantri.create(  req.body );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findOneKelas (req, res){
        try {
            const kelas = await kelasSantri.findByPk(  req.params.id );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findAllKelas (req, res){
        try {
            const kelas = await kelasSantri.findAll( );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async findAllKelasLembaga (req, res){
        try {
            const kelas = await kelasLembaga.findAll( );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async updateOneKelas (req, res){
        try {
            const kelas = await kelasSantri.update(  req.body ,{
                where:{id:req.params.id}
            });
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }



    static async createOneKegiatan (req, res){
        try {
            const kelas = await Kegiatan.create(  req.body );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findOneKegiatan (req, res){
        try {
            const kelas = await Kegiatan.findByPk(  req.params.id );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findAllKegiatan(req, res) {
        try {
            const kegiatan = await Kegiatan.findAll();

            // console.log(JSON.stringify(kegiatan, null, 2)); // Log the fetched data
            res.status(200).json(kegiatan);
        } catch (error) {
            console.error("Error fetching kegiatan:", error); // Log the error
            res.status(400).json({ error: error.message });
        }
    }

    static async updateOneKegiatan (req, res){
        try {
            const kelas = await Kegiatan.update(  req.body ,{
                where:{id:req.body.id}
            });
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }


    static async createOneAbsensi (req, res){
        try {
            const editorValidation = await Admin.findByPk(req.body.editor)
            // console.log(req.body)
            if (!editorValidation) {
                return res.status(404).json({ error: 'Editor not found' });
            }


            const now = new Date();
            // Add dateTimeWithTimezone to the request body
            req.body.last_edit = moment.tz(now, 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');



            const kelas = await Absensi.create(  req.body );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findOneAbsensi (req, res){
        try {
            const kelas = await Absensi.findByPk(  req.params.id );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findAllAbsensi (req, res){
        try {
            const kelas = await Absensi.findAll( );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async updateOneAbsensi (req, res){
        try {
            const {id_kegiatan,nis_santri,tanggal}=req.body
            const now = new Date();
            const dateTimeWithTimezone = now.toLocaleString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'Asia/Jakarta' // Replace with your desired timezone
            });

            // Add dateTimeWithTimezone to the request body
            req.body.last_edit = dateTimeWithTimezone;
            const absen = await Absensi.update(  req.body ,{
                where:{
                    id_kegiatan:id_kegiatan,
                    nis_santri:nis_santri,
                    tanggal:tanggal,

                }
            });
            res.status(201).json(absen);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async createOneAdmin(req, res){
        try {
           // const { nis,rfid, nama_santri,gender, is_pondok, is_sdi,is_mts,is_ma,is_madin } = req.body;
            const santri = await Admin.create(req.body);
            res.status(201).json(santri);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async createManyAdmin(req, res){
        try {
           // const { nis,rfid, nama_santri,gender, is_pondok, is_sdi,is_mts,is_ma,is_madin } = req.body;
            console.log("babi")
            const santri = await Admin.bulkCreate(req.body,{validate:true});
            res.status(201).json(santri);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findAllAdmin(req, res){
        try {
            const santris = await Admin.findAll();
            res.status(201).json(santris);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findAllMesin(req, res) {
        try {
            const mesin = await Admin.findAll({
                where: {
                    nis: {
                        [Op.regexp]: '^[0-9]{3}$' // Regular expression to match exactly 3 digits
                    }
                }
            });
            res.status(201).json(mesin);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async findOneAdmin(req, res){
        try {
            const { nis,rfid, nama_santri,gender, is_pondok, is_sdi,is_mts,is_ma,is_madin } = req.body;
            const santri = await Admin.findByPk(req.params.nis)
            res.status(201).json(santri);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async updateOneAdmin(req, res){
        try {

            const updated = await Admin.update(req.body, {
                where: { nis: req.body.nis }
            });
            if (updated[0] > 0) {
                res.status(200).send(updated);
            } else {
                res.status(404).send('Admin not found');
            }
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    static async adminLogin(req,res){
        const { phone, password } = req.body;
        try {
            const admin = await Admin.findOne({ where: { nomer_hp: phone, katasandi: password } });
            if (admin) {
                req.session.user = admin;
                res.status(200).json({ message: 'Login successful', admin });
            } else {
                res.status(401).json({ message: 'Number or password wrong' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async adminLogout(req,res){
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Logout failed' });
            }
            res.status(200).json({ message: 'Logout successful' });
        });
    }

    static async createOneKalenderLibur(req, res){
        try {

            const santri = await KalenderLibur.create(req.body);
            res.status(201).json(santri);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findAllKalenderLibur(req, res){
        try {
            const santris = await KalenderLibur.findAll();
            res.status(201).json(santris);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async findOneKalenderLibur(req, res){
        try {
            const { nis,rfid, nama_santri,gender, is_pondok, is_sdi,is_mts,is_ma,is_madin } = req.body;
            const santri = await KalenderLibur.findByPk(req.params.nis)
            res.status(201).json(santri);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async updateOneKalenderLibur(req, res){
        try {
            const updated = await KalenderLibur.update(req.body, {
                where: { nis: req.params.nis }
            });
            if (updated[0] > 0) {
                res.status(200).send('Santri updated!');
            } else {
                res.status(404).send('Santri not found');
            }
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    static async paginationDataSantri(req, res){

        try {
            // Normalize input parameters and decode URI components
            const namaInstansi = decodeURIComponent(req.params.nama_instansi).toLowerCase();
            const kelasInstansi = decodeURIComponent(req.params.kelas_instansi).toLowerCase();
            const tahunAjaran = req.params.tahun_ajaran;
            const page = parseInt(req.params.page, 10);
            const limit = 100;
            const offset = (page - 1) * limit;

            // Build the query condition dynamically based on input parameters
            let whereCondition = {};
            if (kelasInstansi.includes("semua") && namaInstansi.includes("semua")) {
                // Search all kelasSantri where tahunAjaran matches
                whereCondition.tahun_ajaran = tahunAjaran;
            } else if (kelasInstansi.includes("semua")) {
                // Search all kelas within the specified namaInstansi
                whereCondition.pemilik = namaInstansi;
                whereCondition.tahun_ajaran = tahunAjaran;
            } else if (namaInstansi.includes("semua")) {
                // Search all kelas regardless of pemilik where tahunAjaran matches
                whereCondition.tahun_ajaran = tahunAjaran;
            } else {
                // Search based on all provided parameters
                whereCondition = {
                    pemilik: namaInstansi,
                    kelas: kelasInstansi,
                    tahun_ajaran: tahunAjaran
                };
            }

            // Execute the query with the dynamic condition
            const result = await kelasSantri.findAll({
                where: whereCondition,
                limit: limit,
                offset: offset
            });

            // Extract nis_santri from the results
            const nisSantriList = result.map(item => item.nis_santri);

            // Find corresponding Santri records
            const santriRecords = await Santri.findAll({
                where: {
                    nis: nisSantriList
                }
            });

            // Map the results to include Santri details
            const finalResults = result.map(kelasItem => {
                const santriDetail = santriRecords.find(santri => santri.nis === kelasItem.nis_santri);
                return {
                    ...kelasItem.dataValues,
                    santriDetail: santriDetail ? santriDetail.dataValues : null,


                };
            });

            res.status(200).json(finalResults);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            res.status(500).send('Error retrieving data');
        }
    }

    static async  gabungKelasSama(req, res) {
        if (req.body.merge !== true) {
            return res.status(400).send('Merge parameter not set correctly.');
        }

        try {
            // Find unique combinations of kelas, pemilik, tahun_ajaran in kelasSantri
            // const uniqueCombinations = await kelasSantri.findAll({
            //     attributes: ['kelas', 'pemilik', 'tahun_ajaran'],
            //     group: ['kelas', 'pemilik', 'tahun_ajaran']
            // });
            //
            // // Iterate over each unique combination found
            // for (const combination of uniqueCombinations) {
            //     const { kelas, pemilik, tahun_ajaran } = combination;
            //
            //     // Check if this combination already exists in kelasLembaga
            //     const existsInLembaga = await kelasLembaga.findOne({
            //         where: { kelas, pemilik, tahun_ajaran }
            //     });
            //
            //     // If not exists, create in kelasLembaga
            //     if (!existsInLembaga) {
            //         await kelasLembaga.create({ kelas, pemilik, tahun_ajaran });
            //     }
            // }
            //
            // res.status(200).send('Merge completed successfully.');
        } catch (error) {
            console.error('Failed to merge records:', error);
            res.status(500).send('Error merging records');
        }
    }

    static async getDataAbsenPerkelas(req, res) {
        try {
            // Normalize input parameters and decode URI components
            const namaInstansi = decodeURIComponent(req.params.nama_instansi).toLowerCase();
            const kelasInstansi = decodeURIComponent(req.params.kelas_instansi).toLowerCase();
            const tahunAjaran = req.params.tahun_ajaran;
            const page = parseInt(req.params.page, 10);
            const limit = 100;
            const offset = (page - 1) * limit;

            // Build the query condition dynamically based on input parameters
            let whereCondition = {};
            if (kelasInstansi.includes("semua") && namaInstansi.includes("semua")) {
                // Search all kelasSantri where tahunAjaran matches
                whereCondition.tahun_ajaran = tahunAjaran;
            } else if (kelasInstansi.includes("semua")) {
                // Search all kelas within the specified namaInstansi
                whereCondition.pemilik = namaInstansi;
                whereCondition.tahun_ajaran = tahunAjaran;
            } else if (namaInstansi.includes("semua")) {
                // Search all kelas regardless of pemilik where tahunAjaran matches
                whereCondition.tahun_ajaran = tahunAjaran;
            } else {
                // Search based on all provided parameters
                whereCondition = {
                    pemilik: namaInstansi,
                    kelas: kelasInstansi,
                    tahun_ajaran: tahunAjaran
                };
            }

            // Execute the query with the dynamic condition
            const result = await kelasSantri.findAll({
                where: whereCondition,
                limit: limit,
                offset: offset
            });

            // Extract nis_santri from the results
            const nisSantriList = result.map(item => item.nis_santri);

            // Find corresponding Santri records
            const santriRecords = await Santri.findAll({
                where: {
                    nis: nisSantriList
                }
            });

            // Find corresponding Absensi records
            const absenRecords = await Absensi.findAll({
                where: {
                    id_kegiatan: req.params.idkegiatan,
                    nis_santri: nisSantriList,
                    tanggal: req.params.tanggal_absen
                }
            });

            // Fetch and add data_editor to each absenRecord
            const absenWithEditor = await Promise.all(absenRecords.map(async absen => {
                const editorData = await Admin.findByPk(absen.editor);
                return {
                    ...absen.dataValues,
                    data_editor: editorData ? editorData.dataValues : null
                };
            }));

            // Map the results to include Santri details and Absensi details with editor data
            const finalResults = result.map(kelasItem => {
                const santriDetail = santriRecords.find(santri => santri.nis === kelasItem.nis_santri);
                const absenDetail = absenWithEditor.find(absen => absen.nis_santri === kelasItem.nis_santri);
                return {
                    ...kelasItem.dataValues,
                    santriDetail: santriDetail ? santriDetail.dataValues : null,
                    absensi: absenDetail ? absenDetail : null,
                };
            });

            res.status(200).json(finalResults);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            res.status(500).send('Error retrieving data');
        }
    }







    // static async (req, res){
    //     try {
    //         const { nis,rfid, nama_santri,gender, is_pondok, is_sdi,is_mts,is_ma,is_madin } = req.body;
    //         const santri = await Santri.create({ nis,rfid, nama_santri,gender, is_pondok, is_sdi,is_mts,is_ma,is_madin });
    //         res.status(201).json(santri);
    //     } catch (error) {
    //         res.status(400).json({ error: error.message });
    //     }
    // }



}