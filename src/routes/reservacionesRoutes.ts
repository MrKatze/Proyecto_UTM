import { Router } from 'express';
import { reservacionesController } from '../controllers/reservacionesController';
import { validarToken } from '../middleware/auth';

class ReservacionesRoutes{

    public router: Router = Router();
    constructor(){
        this.config();
    }

    config() : void{
        this.router.post('/mostrar_habitaciones_disponibles_una_fecha', reservacionesController.mostrar_habitaciones_disponibles_una_fecha);
        this.router.post('/mostrar_habitaciones_disponibles_rango_fecha', reservacionesController.mostrar_habitaciones_disponibles_rango_fecha);
        this.router.put('/modificar_reservacion/:id',reservacionesController.modificar_reservacion);
        this.router.post('/hacer_reservacion/', reservacionesController.hacer_reservacion);
        this.router.delete('/cancelar_reservacion/:id', reservacionesController.cancelar_reservacion);
        this.router.get('/mostrar_reservaciones_por_fecha/:fecha', reservacionesController.mostrar_reservaciones_por_fecha); // SE HA QUITADO EL TOKEN PARA PRUEBAS
        this.router.post('/mostrar_reservaciones_por_rango_fecha/', reservacionesController.mostrar_reservaciones_por_rango_fecha);
        this.router.put('/modificar_estado_reserva/:id', reservacionesController.modificar_estado_reserva);
        this.router.get('/rellenar_datos_tabla/:fecha', reservacionesController.rellenar_datos_tabla);
    }
}

const reservacionesRoutes = new ReservacionesRoutes();
export default reservacionesRoutes.router;
