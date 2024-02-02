import {Request,Response} from 'express';
import pool from '../database'; //acceso a la base de datos

class ReservacionesController{

    public async rellenar_datos_tabla(req: Request, res: Response): Promise<void>{
        const fechas = req.params;
        console.log(req.body);
        var consulta = `SELECT Cuenta.NombreCompleto, Reservaciones.HoraLlegada, Cuenta.NumeroTelefono, Reservaciones.EstadoReserva 
                            FROM Cuenta JOIN Reservaciones ON Cuenta.IDCuenta = Reservaciones.IDCuenta 
                                WHERE Reservaciones.FechaEntrada = '${fechas.FechaUno}'`;
        const respuesta = await pool.query(consulta);
        res.json(respuesta);
    }

    public async mostrar_habitaciones_disponibles_rango_fecha(req: Request, res: Response): Promise<void>{
        const fechas = req.body;
        var consulta = `SELECT DISTINCT h.IDHabitacion, h.TipoHabitacion, h.MaxHuespedes, h.TotalTipoHabitacion, h.Costo
                        FROM habitaciones h
                            JOIN disponibilidadporfecha d ON h.IDHabitacion = d.IDTipoHabitacion
                            WHERE d.Fecha BETWEEN '${fechas.FechaUno}' AND '${fechas.FechaDos}'
                                AND d.TotalHabitacionesDisponibles > 0
                                AND h.IDHabitacion NOT IN (
                                    SELECT r.IDHabitacion
                                        FROM reservaciones re
                                        JOIN detallesreservacion r ON re.IDReserva = r.IDReservacion
                                        WHERE (re.FechaEntrada <= '${fechas.FechaDos}' AND re.FechaSalida >= '${fechas.FechaUno}')
                                            OR (re.FechaEntrada < '${fechas.FechaUno}' AND re.FechaSalida >= '${fechas.FechaUno}')
        )`
        const respuesta = await pool.query(consulta);
        res.json(respuesta);
    }

    public async mostrar_habitaciones_disponibles_una_fecha(req: Request, res: Response): Promise<void>{
        const fechas = req.body;
        var consulta = `SELECT h.IDHabitacion, h.TipoHabitacion, h.MaxHuespedes, h.TotalTipoHabitacion, h.Costo
                        FROM habitaciones h
                        JOIN disponibilidadporfecha d ON h.IDHabitacion = d.IDTipoHabitacion
                        WHERE d.Fecha BETWEEN '${fechas.FechaUno}' AND '${fechas.FechaDos}'
                            AND d.TotalHabitacionesDisponibles > 0
                            AND h.IDHabitacion NOT IN (
                                SELECT r.IDHabitacion
                                FROM reservaciones re
                                JOIN detallesreservacion r ON re.IDReserva = r.IDReservacion
                                    WHERE (re.FechaEntrada < '${fechas.FechaUno}' AND re.FechaSalida > '${fechas.FechaDos}'))`
        
        const respuesta = await pool.query(consulta);
        res.json(respuesta);
    }

    public async mostrar_reservaciones_por_fecha(req: Request, res: Response ): Promise<void>{
        const {fecha} = req.params;
        const respuesta = await pool.query('SELECT * FROM reservaciones WHERE FechaEntrada = ?', [fecha]);
        res.json( respuesta );
    }


    public async mostrar_reservaciones_por_rango_fecha(req: Request, res: Response ): Promise<void>{ // PENDIENTE
        const fechas = req.body;
        var consulta = `SELECT * FROM reservaciones WHERE FechaEntrada >= '${fechas.FechaUno}' AND FechaEntrada <= '${fechas.FechaDos}'`;
        const resp = await pool.query(consulta);
        res.json( resp );
    }

    public async hacer_reservacion(req: Request, res: Response): Promise<void> {
        try {
            const datos_reserva = req.body;
    
            // Insertar reserva
            const insert_reserva = `INSERT INTO Reservaciones (IDCuenta, FechaEntrada, FechaSalida, HoraLlegada) VALUES ('${datos_reserva.IDCuenta}', '${datos_reserva.FechaEntrada}', '${datos_reserva.FechaSalida}', '${datos_reserva.HoraLlegada}')`;
            const consulta = await pool.query(insert_reserva);
            const idReservacion = consulta.insertId;
    
            // Insertar detalles de reserva
            const insert_detallesReser = `INSERT INTO DetallesReservacion (IDReservacion, IDHabitacion, CantidadHabitaciones) VALUES ('${idReservacion}', '${datos_reserva.IDHabitacion}', '${datos_reserva.CantidadHabitaciones}');`;
            const consulta2 = await pool.query(insert_detallesReser);
    
            // Actualizar disponibilidad por fecha
            const update = `UPDATE disponibilidadporfecha SET TotalHabitacionesDisponibles = TotalHabitacionesDisponibles - '${datos_reserva.CantidadHabitaciones}' WHERE Fecha = '${datos_reserva.FechaEntrada}' AND IDTipoHabitacion = '${datos_reserva.IDHabitacion}'`;
            const consulta3 = await pool.query(update);
    
            // Responder con un objeto JSON que contenga información sobre la reserva
            res.json({
                reserva: consulta,
                detallesReserva: consulta2,
                disponibilidadActualizada: consulta3
            });
        } catch (error) {
            // Manejar errores y responder adecuadamente
            console.error(error);
            res.status(500).json({ mensaje: 'Error interno del servidor' });
        }
    }
    

    // public async hacer_reservacion(req: Request, res: Response): Promise<void> {
    //     const datos_reserva = req.body;
    //     var insert_reserva = `INSERT INTO Reservaciones (IDCuenta, FechaEntrada, FechaSalida, HoraLlegada) VALUES ('${datos_reserva.IDCuenta}', '${datos_reserva.FechaEntrada}', '${datos_reserva.FechaSalida}', '${datos_reserva.HoraLlegada}')`;
    //     const consulta = await pool.query(insert_reserva);
    //     // res.json(consulta);

    //     var insert_detallesReser = `INSERT INTO DetallesReservacion (IDReservacion, IDHabitacion, CantidadHabitaciones) VALUES ('${consulta.insertId}', '${datos_reserva.IDHabitacion}', '${datos_reserva.CantidadHabitaciones}');`;
    //     const consulta2 = await pool.query(insert_detallesReser);
    //     // res.json(consulta2);

    //     var update = `UPDATE disponibilidadporfecha SET TotalHabitacionesDisponibles = TotalHabitacionesDisponibles - '${datos_reserva.CantidadHabitaciones}' WHERE Fecha = '${datos_reserva.FechaEntrada}' AND IDTipoHabitacion = '${datos_reserva.IDHabitacion}'`;
    //     const consulta3 = await pool.query(update);
    //     // res.json(consulta3);
    // }

    public async modificar_reservacion(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        console.log(id);
        const resp = await pool.query("UPDATE reservaciones set ? WHERE IDReserva = ?", [req.body, id]);
        res.json(resp);
    }

    public async cancelar_reservacion(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const resp = await pool.query(`DELETE FROM reservaciones WHERE IDReserva = ${id}`);
        const resp2 = await pool.query(`DELETE FROM detallesreservacion WHERE IDReservacion = ${id}`);
        res.json(resp);
    }

    public async modificar_estado_reserva(req: Request, res: Response): Promise <void> {
        const {id} = req.params;
        const resp = await pool.query('UPDATE reservaciones SET ? WHERE IDReserva = ?',[req.body,id])
        console.log(req.body)
        res.json(resp)
    }
}

export const reservacionesController = new ReservacionesController();