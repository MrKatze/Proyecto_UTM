import {Request,Response} from 'express';
import pool from '../database'; //acceso a la base de datos

class DisponibilidadporfechaController{
    
    public async mostrar_disponibilidad_fecha(req: Request, res: Response): Promise <void>{
        const {fecha} = req.params;
        const respuesta = await pool.query('SELECT Fecha, h.TipoHabitacion, TotalHabitacionesDisponibles FROM disponibilidadporfecha JOIN habitaciones AS h ON h.IDHabitacion = IDTipoHabitacion WHERE DATE(Fecha) = ?',[`${fecha}`]);
        res.json( respuesta );
    }

    public async agregar_disponibilidad(req: Request, res: Response): Promise<void> {
        //console.log(req.body)
        const resp = await pool.query("INSERT INTO disponibilidadporfecha set ?",[req.body]);
        res.json(resp);
        //res.json(null);
    }
}

export const disponibilidadporfechaController = new DisponibilidadporfechaController();