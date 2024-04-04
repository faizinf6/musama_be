import { Router } from 'express';
const router = Router();
import {Controller} from "./controller.js";

router.get('/santri/:nis',Controller.findOneSantri)
router.get('/all-santri',Controller.findAllsantri)
router.post('/create-santri',Controller.createOneSantri)
router.post('/create-santri-banyak',Controller.createManySantri)
router.patch('/update-santri/:nis',Controller.updateOneSantri)


router.get('/kelas/:id',Controller.findOneKelas)
router.get('/all-kelas',Controller.findAllKelas)
router.post('/create-kelas',Controller.createOneKelasSantri)
router.patch('/update-kelas/:id',Controller.updateOneKelas)

router.get('/kegiatan/:id',Controller.findOneKegiatan)
router.get('/all-kegiatan',Controller.findAllKegiatan)
router.post('/create-kegiatan',Controller.createOneKegiatan)
router.patch('/update-kegiatan/:id',Controller.updateOneKegiatan)

router.get('/absensi/:id',Controller.findOneAbsensi)
router.get('/all-absensi',Controller.findAllAbsensi)
router.post('/create-absensi',Controller.createOneAbsensi)
router.patch('/update-absensi/:id',Controller.updateOneAbsensi)

router.get('/admin/:id',Controller.findOneAdmin)
router.get('/all-admin',Controller.findAllAdmin)
router.post('/create-admin',Controller.createOneAdmin)
router.patch('/update-admin/:id',Controller.updateOneAdmin)


router.get('/santri/mts', async (req, res) => {
    res.json({ status: true, message: "Santri Mts Coooy!!" })
});

export default router;

