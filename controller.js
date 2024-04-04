import {Santri,kelasSantri,Kegiatan,Absensi,Admin} from "./models/models.js";

export class Controller {
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

            // Iterate over each santri object in the array
            for (const data of santrisData) {
                // Check if a santri with the specified nis already exists in the database
                const existingSantri = await Santri.findByPk(data.nis);

                // If the santri doesn't exist, create a new record
                if (!existingSantri) {
                    await Santri.create(data);
                } else {
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
                        console.log("babi")
                        console.log(pemilikField)
                        // Prepare the kelasSantri data for creation or update
                        const kelasData = {
                            nis_santri: data.nis,
                            kelas: data[kelasField],
                            pemilik: pemilikField,
                            tahun_ajaran: tahun_ajaran
                        };

                        // Check if a kelasSantri record already exists for the santri and institution
                        const existingKelas = await kelasSantri.findOne({
                            where: {
                                nis_santri: data.nis,
                                pemilik: institution
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
                                    pemilik: institution
                                }
                            });
                        }
                    }
                }
            }

            // Send a success response after processing all santri data
            res.status(200).json({ message: 'Batch processing of santris completed.' });
        } catch (error) {
            // Send an error response if any exception occurs
            res.status(500).json({ error: error.message });
        }
    }

    static async findAllsantri(req, res){
        try {
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

    static async findAllKegiatan (req, res){
        try {
            const kelas = await Kegiatan.findAll( );
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async updateOneKegiatan (req, res){
        try {
            const kelas = await Kegiatan.update(  req.body ,{
                where:{id:req.params.id}
            });
            res.status(201).json(kelas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }


    static async createOneAbsensi (req, res){
        try {
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
            const kelas = await Absensi.update(  req.body ,{
                where:{id:req.params.id}
            });
            res.status(201).json(kelas);
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

    static async findAllAdmin(req, res){
        try {
            const santris = await Admin.findAll();
            res.status(201).json(santris);
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