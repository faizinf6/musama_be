import {
    Absensi,
    Admin,
    FilterMesin,
    KalenderLibur,
    Kegiatan,
    kelasLembaga,
    kelasSantri,
    Santri,
    tahunAjaranTabel
} from "./models/models.js";
import {Op} from "sequelize";
import moment from 'moment-timezone';


const tahunAjaran = {
    'SDI': '2023-2024',
    'Mts': '2023-2024',
    'MA': '2023-2024',
    'Madin': '1445-1446',
    'Pondok': '1445-1446'
};

const keteranganKehadiranMap = {
    'HADIR': '·',
    'ALPA': 'A',
    'SAKIT': 'S',
    'IZIN': 'I',
    'null': '-'
};

const dayTranslations = {
    Sunday: 'Ahad',
    Monday: 'Senin',
    Tuesday: 'Selasa',
    Wednesday: 'Rabu',
    Thursday: 'Kamis',
    Friday: 'Jumat',
    Saturday: 'Sabtu'
};


const getLembagaFlag = pemilikKelas => ({
    is_pondok: pemilikKelas === 'pondok',
    is_sdi: pemilikKelas === 'sdi',
    is_mts: pemilikKelas === 'mts',
    is_ma: pemilikKelas === 'ma',
    is_madin: pemilikKelas === 'madin'
});


const updateStatusAbsensiPerhari = async (date) => {
    const hariIndonesia = ['ahad', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const nama_hari_ini = hariIndonesia[date.day()].toLowerCase();

    const dateTimeWithTimezone = moment.tz(date, 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const localDate = moment.tz(date, 'Asia/Jakarta').format('YYYY-MM-DD');
    console.log("tanggalan");
    console.log(localDate);

    const [kalenderLiburPadaHariIni, daftarKegiatanAktif] = await Promise.all([
        KalenderLibur.findOne({
            where: {
                sudah_terlewati: false,
                tanggal: localDate
            }
        }),
        Kegiatan.findAll({
            where: {
                status_kegiatan: true
            }
        })
    ]);

    const tasks = [];

    for (let kegiatanAktif of daftarKegiatanAktif) {
        let statusAbsensi = kegiatanAktif.libur_perminggu.toLowerCase() !== nama_hari_ini ? 'HADIR' : 'LIBUR';

        if (kalenderLiburPadaHariIni && kalenderLiburPadaHariIni.dataValues.id_kegiatan_terimbas.includes(kegiatanAktif.id)) {
            statusAbsensi = 'LIBUR';
        }

        for (let kelas of kegiatanAktif.peserta) {
            const pesertaKegiatan = await kelasSantri.findAll({
                where: {
                    kelas: kelas.Kelas,
                    tahun_ajaran: tahunAjaran[kegiatanAktif.pemilik]
                }
            });

            for (const peserta of pesertaKegiatan) {
                tasks.push((async () => {
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
                })());
            }
        }
    }

    await Promise.all(tasks);
};

export async function updateStatusAbsensiPerbulan() {
    const now = moment.tz('Asia/Jakarta').startOf('day');
    const startDate = now.clone().startOf('month');
    const tasks = [];

    for (let i = 0; i < 30; i++) {
        const currentDate = startDate.clone().add(i, 'days');
        tasks.push(updateStatusAbsensiPerhari(currentDate));
    }

    await Promise.all(tasks);
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

    static async rekapAbsensi(req, res) {
        try {
            const { id_kegiatan, nama_kelas, tanggal_mulai, tanggal_sampai, tahun_ajaran } = req.body;
            const dataKegiatan = await Kegiatan.findByPk(id_kegiatan);
            console.log(req.body);

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
            const nisSantriList = collectedStudents.map(student => student.nis_santri);
            const startDate = moment(tanggal_mulai, 'DD-MM-YYYY');
            const endDate = moment(tanggal_sampai, 'DD-MM-YYYY');
            const dateRange = [];

            // Step 3: Generate date range
            let currentDate = startDate.clone();
            while (currentDate.isSameOrBefore(endDate)) {
                dateRange.push(currentDate.format('YYYY-MM-DD'));
                currentDate.add(1, 'days');
            }

            // Step 4: Fetch all absensi records in one query
            const absensiRecords = await Absensi.findAll({
                where: {
                    nis_santri: nisSantriList,
                    id_kegiatan: id_kegiatan,
                    tanggal: dateRange
                }
            });

            // Step 5: Organize absensi records by student and date
            const absensiMap = {};
            absensiRecords.forEach(record => {
                if (!absensiMap[record.nis_santri]) {
                    absensiMap[record.nis_santri] = {};
                }
                absensiMap[record.nis_santri][record.tanggal] = record.status_absensi;
            });

            // Step 6: Process each student in parallel
            await Promise.all(collectedStudents.map(async student => {
                const nis_santri = student.nis_santri;
                const datSantri = await Santri.findByPk(nis_santri);
                const attendanceData = {};
                let totalHadir = 0;
                let totalAlpa = 0;
                let totalSakit = 0;
                let totalIzin = 0;

                dateRange.forEach((date, index) => {
                    const dayCounter = index + 1;
                    const status = absensiMap[nis_santri] ? absensiMap[nis_santri][date] : "-";
                    attendanceData[`day${dayCounter}`] = status;

                    // Increment the corresponding counter
                    if (status === 'HADIR') {
                        totalHadir++;
                    } else if (status === 'ALPA') {
                        totalAlpa++;
                    } else if (status === 'SAKIT') {
                        totalSakit++;
                    } else if (status === 'IZIN') {
                        totalIzin++;
                    }
                });

                // Step 7: Add the student's data to the response array
                response.push({
                    santri: datSantri.dataValues,
                    attendance_data: attendanceData,
                    totalHadir: totalHadir,
                    totalAlpa: totalAlpa,
                    totalSakit: totalSakit,
                    totalIzin: totalIzin
                });
            }));

            // Step 8: Send the response as JSON
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

    static async createManySantri  (req, res)  {
        const { data_kelas_lembaga, data_kelas_santri, data_santri } = req.body;

        const { pemilik: pemilikKelas, tahun_ajaran: tahunAjaran } = data_kelas_lembaga[0];
        console.log('Pemilik Kelas:', pemilikKelas);
        console.log('Tahun Ajaran:', tahunAjaran);

        try {
            // Process Santri data
            await Promise.all(data_santri.map(async santriData => {
                try {
                    // console.log('Santri Data:', santriData);
                    const { nis_santri, nama_santri, rfid, gender } = santriData;
                    let santri = await Santri.findByPk(nis_santri);
                    // console.log('Santri found:', santri);

                    if (!santri) {
                        // Create new Santri
                        const lembagaFlag = getLembagaFlag(pemilikKelas);
                        // console.log('Creating Santri with flags:', lembagaFlag);
                        santri = await Santri.create({ nis: nis_santri, nama_santri, rfid, gender, ...lembagaFlag });
                        // console.log('Santri created:', santri);
                    } else {
                        // Update existing Santri
                        const lembagaFlag = getLembagaFlag(pemilikKelas);
                        // console.log('Updating Santri with flags:', lembagaFlag);
                        await santri.update({ nama_santri, rfid, gender, ...lembagaFlag });
                        // console.log('Santri updated:', santri);
                    }
                } catch (error) {
                    console.error('Error processing santriData:', santriData, error);
                    throw error;
                }
            }));

            // Process kelasLembaga data
            await Promise.all(data_kelas_lembaga.map(async kelasLembagaData => {
                try {
                    console.log('Kelas Lembaga Data:', kelasLembagaData);
                    const { kelas, pemilik, tahun_ajaran } = kelasLembagaData;
                    let kelasLembagaInstance = await kelasLembaga.findOne({ where: { kelas, pemilik, tahun_ajaran } });
                    console.log('Kelas Lembaga found:', kelasLembagaInstance);

                    if (!kelasLembagaInstance) {
                        await kelasLembaga.create({ kelas, pemilik, tahun_ajaran });
                        console.log('Kelas Lembaga created:', { kelas, pemilik, tahun_ajaran });
                    } else {
                        await kelasLembagaInstance.update({ kelas, pemilik, tahun_ajaran });
                        console.log('Kelas Lembaga updated:', kelasLembagaInstance);
                    }
                } catch (error) {
                    console.error('Error processing kelasLembagaData:', kelasLembagaData, error);
                    throw error;
                }
            }));

            // Process kelasSantri data
            await Promise.all(data_kelas_santri.map(async kelasSantriData => {
                try {
                    console.log('Kelas Santri Data:', kelasSantriData);
                    const { nis_santri, kelas, pemilik, tahun_ajaran } = kelasSantriData;
                    let kelasSantriInstance = await kelasSantri.findOne({ where: { nis_santri, kelas, pemilik, tahun_ajaran } });
                    console.log('Kelas Santri found:', kelasSantriInstance);

                    if (!kelasSantriInstance) {
                        await kelasSantri.create({ nis_santri, kelas, pemilik, tahun_ajaran });
                        console.log('Kelas Santri created:', { nis_santri, kelas, pemilik, tahun_ajaran });
                    } else {
                        await kelasSantriInstance.update({ nis_santri, kelas, pemilik, tahun_ajaran });
                        console.log('Kelas Santri updated:', kelasSantriInstance);
                    }
                } catch (error) {
                    console.error('Error processing kelasSantriData:', kelasSantriData, error);
                    throw error;
                }
            }));

            res.status(200).json({ message: 'Success' });
        } catch (error) {
            console.error('Error in createManySantri:', error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    };





    // static async createManySantri(req, res){
    //     try {
    //         // Retrieve the array of santri data from the request body
    //         const santrisData = req.body;
    //         // console.log(santrisData)
    //
    //
    //         // Iterate over each santri object in the array
    //         for (const data of santrisData) {
    //             console.log(data.nis)
    //             // Check if a santri with the specified nis already exists in the database
    //             const existingSantri = await Santri.findOne({where:{nis:data.nis}});
    //             // console.log("babi")
    //
    //
    //             // If the santri doesn't exist, create a new record
    //             if (!existingSantri) {
    //                 await Santri.create(data);
    //             } else {
    //                 // If the santri exists, update the existing record with the new data
    //                 await Santri.update(data, { where: { nis: data.nis } });
    //             }
    //
    //             // Define the list of institutions to check for each santri
    //             const institutions = ['is_sdi', 'is_mts', 'is_ma', 'is_madin'];
    //             // Calculate the tahun_ajaran based on the current year
    //             const currentYear = new Date().getFullYear();
    //             let tahun_ajaran = `${currentYear - 1}-${currentYear}`;
    //
    //             // Process each institution flag in the santri data
    //             for (const institution of institutions) {
    //                 // Check if the santri is associated with the current institution
    //                 if (data[institution]) {
    //                     // Construct the kelas field name based on the institution
    //                     const kelasField = `kelas_${institution.split('_')[1]}`; // e.g., kelas_sdi
    //                     const pemilikField = `${institution.split('_')[1]}`; // e.g., sdi
    //                     if (pemilikField.toLowerCase() === 'madin'){
    //
    //
    //                         const mahfudz = await tahunAjaranTabel.findOne({
    //                             where:{
    //                                 status:true,
    //                                 pemilik:pemilikField.toLowerCase()
    //                             }
    //                         })
    //
    //                         // console.log("celeng")
    //                         // console.log(mahfudz.dataValues.nama_tahun)
    //                         tahun_ajaran = mahfudz.dataValues.nama_tahun
    //
    //                     }
    //
    //                     // Prepare the kelasSantri data for creation or update
    //                     const kelasData = {
    //                         nis_santri: data.nis,
    //                         kelas: data[kelasField],
    //                         pemilik: pemilikField,
    //                         tahun_ajaran: tahun_ajaran
    //                     };
    //                     console.log("babi")
    //                     console.log(kelasData)
    //                     console.log(pemilikField)
    //
    //                     // Check if a kelasSantri record already exists for the santri and institution
    //                     const existingKelas = await kelasSantri.findOne({
    //                         where: {
    //                             nis_santri: data.nis,
    //                             pemilik: pemilikField
    //                         }
    //                     });
    //
    //                     // If the kelasSantri record doesn't exist, create a new one
    //                     if (!existingKelas) {
    //                         await kelasSantri.create(kelasData);
    //                     } else {
    //                         // If the record exists, update it with the new data
    //                         await kelasSantri.update(kelasData, {
    //                             where: {
    //                                 nis_santri: data.nis,
    //                                 pemilik: pemilikField
    //                             }
    //                         });
    //                     }
    //                 }
    //             }
    //         }
    //
    //         // ini unutk membuat nama-nama kelas yang unik satu dengan yang lainya!
    //
    //
    //         // Find unique combinations of kelas, pemilik, tahun_ajaran in kelasSantri
    //         const uniqueCombinations = await kelasSantri.findAll({
    //             attributes: ['kelas', 'pemilik', 'tahun_ajaran'],
    //             group: ['kelas', 'pemilik', 'tahun_ajaran']
    //         });
    //
    //         // Iterate over each unique combination found
    //         for (const combination of uniqueCombinations) {
    //             const { kelas, pemilik, tahun_ajaran } = combination;
    //
    //             // Check if this combination already exists in kelasLembaga
    //             const existsInLembaga = await kelasLembaga.findOne({
    //                 where: { kelas, pemilik, tahun_ajaran }
    //             });
    //
    //             // If not exists, create in kelasLembaga
    //             if (!existsInLembaga) {
    //                 await kelasLembaga.create({ kelas, pemilik, tahun_ajaran });
    //             }
    //         }
    //
    //
    //         // Send a success response after processing all santri data
    //         res.status(200).json({ message: 'Batch processing of santris completed. dan nama kelas lembaga telah dibuat' });
    //     } catch (error) {
    //         // Send an error response if any exception occurs
    //         res.status(500).json({ error: error.message });
    //     }
    // }

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
        const kegiatanData = req.body;

        try {
            // Create a new Kegiatan record
            const createdKegiatan = await Kegiatan.create({
                status_kegiatan: kegiatanData.status_kegiatan,
                bisa_terlambat: kegiatanData.bisa_terlambat,
                nama_kegiatan: kegiatanData.nama_kegiatan,
                pemilik: kegiatanData.pemilik,
                jam_mulai: kegiatanData.jam_mulai,
                jam_terlambat: kegiatanData.jam_terlambat,
                jam_selesai: kegiatanData.jam_selesai,
                libur_perminggu: kegiatanData.libur_perminggu,
                daftar_mesin: kegiatanData.daftar_mesin,
                peserta: kegiatanData.peserta
            });

            // Add "aktif" attribute to each peserta in kelas_terfilter
            const pesertaWithAktif = kegiatanData.peserta.map(peserta => ({
                ...peserta,
                aktif: true
            }));

            // Create records in FilterMesin for each mesin
            const mesinPromises = kegiatanData.daftar_mesin.map(async (mesin) => {
                return await FilterMesin.create({
                    id_kegiatan: createdKegiatan.id,
                    id_mesin: mesin.id_mesin,
                    is_laki: true,
                    is_perempuan: true,
                    kelas_terfilter: pesertaWithAktif
                });
            });

            await Promise.all(mesinPromises);

            res.status(201).json({ createdKegiatan });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while creating the records.' });
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

    static async createOneFilterMesin (req, res){
        try {
            const kelas = await FilterMesin.create(  req.body );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findOneFilter (req, res){
        try {
            const kelas = await FilterMesin.findByPk(  req.params.id );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findAllFilterMesin(req, res) {
        try {
            // Fetch all FilterMesin records
            const filterMesinRecords = await FilterMesin.findAll();

            // Initialize an array to hold the results
            const results = [];

            // Iterate over each FilterMesin record
            for (const filterMesin of filterMesinRecords) {
                // Fetch the related Kegiatan record
                const kegiatan = await Kegiatan.findOne({ where: { id: filterMesin.id_kegiatan } });

                // Fetch the related Admin record
                const admin = await Admin.findOne({ where: { nis: filterMesin.id_mesin } });

                // If both related records are found, include them in the result
                if (kegiatan && admin) {
                    results.push({
                        dataMesin:{
                            filterMesinData:filterMesin,
                            kegiatanData:kegiatan,
                            adminData:admin,
                        }
                    });
                }
            }

            // Send the aggregated data to the client
            res.json(results);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while fetching data.' });
        }




    }

    static async updateOneFilterMesin (req, res){
        try {
            const { id_kegiatan,id_mesin, is_laki, is_perempuan } = req.body;

            const kelas = await FilterMesin.update(  req.body ,{
                where:{
                    id_kegiatan:id_kegiatan,
                    id_mesin:id_mesin,
                }
            });

            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async updateStatusCctv (req, res){
        const { id_mesin, cctv } = req.body;

        console.log('Received request to update atribut_mesin:', req.body);

        try {
            // Find the admin with the specific id_mesin
            const admin = await Admin.findOne({ where: { nis: id_mesin } });

            if (!admin) {
                console.log('Admin not found for id_mesin:', id_mesin);
                return res.status(404).json({ message: 'Admin not found' });
            }

            // Parse the atribut_mesin JSON
            let atribut_mesin = admin.atribut_mesin;

            if (!Array.isArray(atribut_mesin)) {
                atribut_mesin = [];
            }

            console.log('Current atribut_mesin:', atribut_mesin);

            // Update the specific cctv value
            atribut_mesin = atribut_mesin.map(item => {
                if (item.cctv) {
                    item.cctv = { ...item.cctv, ...cctv };
                }
                return item;
            });

            console.log('Updated atribut_mesin:', atribut_mesin);

            // Save the updated atribut_mesin back to the admin
            await Admin.update(
                { atribut_mesin },
                { where: { nis: id_mesin } }
            );

            // Fetch the admin again to confirm the update
            const updatedAdmin = await Admin.findOne({ where: { nis: id_mesin } });
            const updatedAdminJSON = JSON.stringify(updatedAdmin.dataValues, null, 2);
            // console.log('Admin updated successfully:', updatedAdminJSON);

            res.status(200).json({ message: 'Atribut mesin updated successfully', admin: updatedAdmin });
        } catch (error) {
            console.error('Error updating atribut_mesin:', error);
            res.status(500).json({ message: 'An error occurred while updating atribut_mesin' });
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

    static async createOnetahunAjaranTabel(req, res){
        try {

            const santri = await tahunAjaranTabel.create(req.body);
            res.status(201).json(santri);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async findAlltahunAjaranTabel(req, res){
        try {
            const santris = await tahunAjaranTabel.findAll();
            res.status(201).json(santris);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async findOnetahunAjaranTabel(req, res){
        try {
            const santri = await tahunAjaranTabel.findByPk(req.body.nama_tahun)
            res.status(201).json(santri);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async updateOnetahunAjaranTabel(req, res){
        try {
            const updated = await tahunAjaranTabel.update(req.body, {
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

            console.log("celeng69")
            console.log(tahunAjaran)

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


    static async getKegiatanMesin (req, res){
        try {
            const todayEnglish = moment().format('dddd'); // Get current day in English
            const today = dayTranslations[todayEnglish]; // Translate to Indonesian
            const currentDate = moment().format('YYYY-MM-DD'); // Get current date in YYYY-MM-DD format
            const id_mesin = req.params.id;

            // Step 1: Find all Kegiatan with status_kegiatan = true and libur_perminggu not equal to today
            const kegiatans = await Kegiatan.findAll({
                where: {
                    status_kegiatan: true,
                    libur_perminggu: { [Op.ne]: today }
                }
            });

            // Step 2: Find all KalenderLibur with tanggal equal to current date
            const kalenderLiburs = await KalenderLibur.findAll({
                where: {
                    tanggal: currentDate
                }
            });

            // Step 3: Filter Kegiatan based on KalenderLibur
            const collectedKegiatans = kegiatans.filter(kegiatan => {
                const isHoliday = kalenderLiburs.some(kalender =>
                    kalender.id_kegiatan_terimbas && kalender.id_kegiatan_terimbas.includes(kegiatan.id)
                );
                return !isHoliday;
            });

            // Step 4: Find matching Kegiatan based on id_mesin in daftar_mesin
            const mesinOnKegiatans = collectedKegiatans.filter(kegiatan => {
                return kegiatan.daftar_mesin && kegiatan.daftar_mesin.some(mesin => mesin.id_mesin === id_mesin);
            });

            // Step 5: Find all FilterMesin where id_mesin matches and id_kegiatan matches and merge data
            const matched = await Promise.all(mesinOnKegiatans.map(async kegiatan => {
                const filterMesins = await FilterMesin.findAll({
                    where: {
                        id_mesin: id_mesin,
                        id_kegiatan: kegiatan.id
                    }
                });
                if (filterMesins.length > 0) {
                    return {
                        id_kegiatan: kegiatan.id,
                        id_mesin:filterMesins[0].id_mesin,
                        pemilik:kegiatan.pemilik,
                        nama_kegiatan: kegiatan.nama_kegiatan,
                        jam_mulai:kegiatan.jam_mulai,
                        jam_selesai:kegiatan.jam_selesai,
                        bisa_terlambat:kegiatan.bisa_terlambat,
                        jam_terlambat:kegiatan.jam_terlambat,
                        is_laki:filterMesins[0].is_laki,
                        is_perempuan:filterMesins[0].is_perempuan,
                        kelas_terfilter:filterMesins[0].kelas_terfilter

                    };
                }
                return null;
            }));

            // Step 6: Send back the result to client
            res.json(matched.filter(Boolean)); // Filter out null values
        } catch (error) {
            res.status(500).json({ error: error.message });
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