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
            const { nis,rfid, nama_santri,gender, is_pondok, is_sdi,is_mts,is_ma,is_madin } = req.body;
            const santri = await Santri.findByPk(req.params.nis)
            res.status(201).json(santri);
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