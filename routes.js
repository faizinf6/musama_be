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
router.patch('/update-kegiatan',Controller.updateOneKegiatan)

router.get('/get-mesin-kegiatan/:id',Controller.getKegiatanMesin)
router.get('/get-dbsantri/:pemilik',Controller.getDbSantri)


router.get('/filter-mesin/:id',Controller.findOneFilter)
router.get('/all-filter-mesin',Controller.findAllFilterMesin)
router.post('/create-filter-mesin',Controller.createOneFilterMesin)
router.patch('/update-filter-mesin',Controller.updateOneFilterMesin)

router.get('/absensi/:id',Controller.findOneAbsensi)
router.get('/all-absensi',Controller.findAllAbsensi)
router.post('/create-absensi',Controller.createOneAbsensi)
router.patch('/update-absensi',Controller.updateOneAbsensi)

router.get('/admin/:id',Controller.findOneAdmin)
router.get('/all-admin',Controller.findAllAdmin)
router.get('/all-mesin',Controller.findAllMesin)
router.post('/create-admin',Controller.createOneAdmin)
router.post('/create-admin-banyak',Controller.createManyAdmin)
router.patch('/update-admin',Controller.updateOneAdmin)
router.post('/auth',Controller.adminLogin)
router.post('/logout',Controller.adminLogout)

router.get('/kalenderlibur/:id',Controller.findOneKalenderLibur)
router.get('/all-kalenderlibur',Controller.findAllKalenderLibur)
router.post('/create-kalenderlibur',Controller.createOneKalenderLibur)
router.patch('/update-kalenderlibur/:id',Controller.updateOneKalenderLibur)

router.get('/tahun-ajaran/:id',Controller.findOnetahunAjaranTabel)
router.get('/all-tahun-ajaran',Controller.findAlltahunAjaranTabel)
router.post('/create-tahun-ajaran',Controller.createOnetahunAjaranTabel)
router.patch('/update-tahun-ajaran/:id',Controller.updateOnetahunAjaranTabel)
router.patch('/update-status-cctv',Controller.updateStatusCctv)
router.patch('/update-status-main',Controller.updateStatusMain)




router.get('/:nama_instansi/:kelas_instansi/:tahun_ajaran/:page', Controller.paginationDataSantri);
router.get('/get-absensi/:tanggal_absen/:idkegiatan/:nama_instansi/:kelas_instansi/:tahun_ajaran/:page', Controller.getDataAbsenPerkelas);
router.get('/generate-kelas', Controller.gabungKelasSama);
router.get('/all-kelaslembaga', Controller.findAllKelasLembaga);


router.post('/rekap-absensi', Controller.rekapAbsensi);



export default router;

