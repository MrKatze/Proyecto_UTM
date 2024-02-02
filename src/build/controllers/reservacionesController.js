"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservacionesController = void 0;
const database_1 = __importDefault(require("../database")); //acceso a la base de datos
class ReservacionesController {
    rellenar_datos_tabla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.params;
            console.log(req.body);
            var consulta = `SELECT Cuenta.NombreCompleto, Reservaciones.HoraLlegada, Cuenta.NumeroTelefono, Reservaciones.EstadoReserva 
                            FROM Cuenta JOIN Reservaciones ON Cuenta.IDCuenta = Reservaciones.IDCuenta 
                                WHERE Reservaciones.FechaEntrada = '${fechas.FechaUno}'`;
            const respuesta = yield database_1.default.query(consulta);
            res.json(respuesta);
        });
    }
    mostrar_habitaciones_disponibles_rango_fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
        )`;
            const respuesta = yield database_1.default.query(consulta);
            res.json(respuesta);
        });
    }
    mostrar_habitaciones_disponibles_una_fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                                    WHERE (re.FechaEntrada < '${fechas.FechaUno}' AND re.FechaSalida > '${fechas.FechaDos}'))`;
            const respuesta = yield database_1.default.query(consulta);
            res.json(respuesta);
        });
    }
    mostrar_reservaciones_por_fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fecha } = req.params;
            const respuesta = yield database_1.default.query('SELECT * FROM reservaciones WHERE FechaEntrada = ?', [fecha]);
            res.json(respuesta);
        });
    }
    mostrar_reservaciones_por_rango_fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.body;
            var consulta = `SELECT * FROM reservaciones WHERE FechaEntrada >= '${fechas.FechaUno}' AND FechaEntrada <= '${fechas.FechaDos}'`;
            const resp = yield database_1.default.query(consulta);
            res.json(resp);
        });
    }
    hacer_reservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const datos_reserva = req.body;
                // Insertar reserva
                const insert_reserva = `INSERT INTO Reservaciones (IDCuenta, FechaEntrada, FechaSalida, HoraLlegada) VALUES ('${datos_reserva.IDCuenta}', '${datos_reserva.FechaEntrada}', '${datos_reserva.FechaSalida}', '${datos_reserva.HoraLlegada}')`;
                const consulta = yield database_1.default.query(insert_reserva);
                const idReservacion = consulta.insertId;
                // Insertar detalles de reserva
                const insert_detallesReser = `INSERT INTO DetallesReservacion (IDReservacion, IDHabitacion, CantidadHabitaciones) VALUES ('${idReservacion}', '${datos_reserva.IDHabitacion}', '${datos_reserva.CantidadHabitaciones}');`;
                const consulta2 = yield database_1.default.query(insert_detallesReser);
                // Actualizar disponibilidad por fecha
                const update = `UPDATE disponibilidadporfecha SET TotalHabitacionesDisponibles = TotalHabitacionesDisponibles - '${datos_reserva.CantidadHabitaciones}' WHERE Fecha = '${datos_reserva.FechaEntrada}' AND IDTipoHabitacion = '${datos_reserva.IDHabitacion}'`;
                const consulta3 = yield database_1.default.query(update);
                // Responder con un objeto JSON que contenga información sobre la reserva
                res.json({
                    reserva: consulta,
                    detallesReserva: consulta2,
                    disponibilidadActualizada: consulta3
                });
            }
            catch (error) {
                // Manejar errores y responder adecuadamente
                console.error(error);
                res.status(500).json({ mensaje: 'Error interno del servidor' });
            }
        });
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
    modificar_reservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            console.log(id);
            const resp = yield database_1.default.query("UPDATE reservaciones set ? WHERE IDReserva = ?", [req.body, id]);
            res.json(resp);
        });
    }
    cancelar_reservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const resp = yield database_1.default.query(`DELETE FROM reservaciones WHERE IDReserva = ${id}`);
            const resp2 = yield database_1.default.query(`DELETE FROM detallesreservacion WHERE IDReservacion = ${id}`);
            res.json(resp);
        });
    }
    modificar_estado_reserva(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const resp = yield database_1.default.query('UPDATE reservaciones SET ? WHERE IDReserva = ?', [req.body, id]);
            console.log(req.body);
            res.json(resp);
        });
    }
}
exports.reservacionesController = new ReservacionesController();
