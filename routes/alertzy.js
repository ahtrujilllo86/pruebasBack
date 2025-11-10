// routes/listaRegistros.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');

// Ruta para insertar nueva apikey
router.get('/', async (req, res) => {
  try {
    let html = `
       <!DOCTYPE html>
        <html lang="es">
        <head>
        <meta charset="UTF-8">
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Registro de App</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            background-color: #f4f4f4;
        }
        h1 {
            text-align: center;
            color: #333;
        }

        /* layout container */
        .page {
            display: flex;
            justify-content: center;
        }
        .columns {
            display: flex;
            gap: 20px;
            width: 100%;
            max-width: 900px;
        }

        /* instrucciones */
        .instructions {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.05);
            flex: 1;
            min-width: 220px;
            align-self: flex-start;
        }
        .instructions p {
            margin: 0;
            color: #333;
            line-height: 1.5;
            font-size: 14px;
        }

        /* form (mantener tu estilo original, pero dentro de la columna derecha) */
        form {
            background: white;
            max-width: 500px;
            width: 100%;
            margin: 0; /* se controla por columns */
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
        }
        input:focus {
            border-color: #007BFF;
            outline: none;
        }
        .input-group {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 15px;
        }
        .input-group input {
            flex: 1;
            margin-bottom: 0;
        }
        button {
            background-color: #007BFF;
            color: white;
            border: none;
            padding: 12px 20px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover:not(:disabled) {
            background-color: #0056b3;
        }
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        #msg, #msgCodigo {
            margin-top: 5px;
            font-size: 14px;
        }
        #registrarBtn {
            width: 100%;
            margin-top: 20px;
        }

        /* responsive: en pantallas pequeñas, instrucciones debajo del título y formulario debajo */
        @media (max-width: 768px) {
            .columns {
            flex-direction: column;
            }
            .instructions {
            order: 1; /* aparece primero dentro de columns, pero como h1 está fuera y centrado, las instrucciones quedarán debajo del título */
            }
            form {
            order: 2;
            }
        }
        </style>
        </head>
        <body>
        <h1>Registro de Aplicación</h1>

        <div class="page">
            <div class="columns">
            <div class="instructions">
                <strong>Instrucciones:</strong><br><br>
                1) Primero debes descargar la app <strong>"Alertzy"</strong> para <a href="https://apps.apple.com/us/app/alertzy/id1532861710">IOS</a> o para <a href="https://play.google.com/store/apps/details?id=notify.me.app">Android</a><br>
                2) En la pestaña inferior <strong>"Account"</strong>, busca <strong>"Your Account Key"</strong> en la parte superior de la pantalla.<br>
                3) Copia esa clave y colócala en el campo <em>Clave de App</em> del formulario, para recibir un mensaje de confirmación. (lo recibirás en la misma App)<br>
                4) Una vez validada la clave de App, se habilitará el botón <strong>Registrar</strong>. Presionalo para finalizar el registro.
                </p>
            </div>

            <form id="registroForm" action="/" method="POST">
                <label for="clave">Alumno</label>
                <input type="text" id="clave" name="clave" readonly>

                <label for="codigo">Clave de App (Account key)</label>
                <div class="input-group">
                <input type="text" id="codigo" name="codigo" placeholder="Account key" required disabled>
                <button type="button" id="validarCodigoBtn" disabled>Validar</button>
                </div>
                <div id="msgCodigo"></div>

                <button type="submit" id="registrarBtn" disabled>Registrar</button>
            </form>
            </div>
        </div>

        <script>
        const msg = document.getElementById('msg');
        const msgCodigo = document.getElementById('msgCodigo');
        const registrarBtn = document.getElementById('registrarBtn');
        const clave = document.getElementById('clave');
        const codigo = document.getElementById('codigo');
        const validarCodigoBtn = document.getElementById('validarCodigoBtn');
        const baseURL = window.location.origin;
        let paramCode;

        document.getElementById('validarCodigoBtn').addEventListener('click', async () => {
            const codigoVal = document.getElementById('codigo').value.trim();
            msgCodigo.textContent = '';

            if (!codigoVal) {
            msgCodigo.textContent = '⚠️ Ingresa el código recibido.';
            msgCodigo.style.color = 'red';
            return;
            }

            msgCodigo.textContent = 'Validando código...';
            msgCodigo.style.color = '#333';

            try {
            const res = await fetch('/validateAppKey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: codigoVal, codigo: paramCode })
            });
            const data = await res.json();
            if (data.success) {
                msgCodigo.textContent = '✅ Clave de app correcta!';
                msgCodigo.style.color = 'green';
                registrarBtn.disabled = false;
            } else {
                msgCodigo.textContent = data.msg;
                msgCodigo.style.color = 'red';
                registrarBtn.disabled = true;
            }
            } catch (err) {
            msgCodigo.textContent = '⚠️ Error de conexión.';
            msgCodigo.style.color = 'red';
            }
        });

        document.addEventListener("DOMContentLoaded", async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (!code) {
                clave.value = 'Si informacion de alumno';
                return;
            }

            if (code) {
                try {
                    const res = await fetch('searchUid', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code })
                    });

                    const data = await res.json();
                    const {name, success} = data;
                    if (success) {
                        validarCodigoBtn.disabled = false
                        codigo.disabled = false;
                        clave.value = name;
                        paramCode = code;
                    } else {
                        clave.value = data.error;
                    }
                } catch (err) {
                    console.log(err);
                    msg.textContent = '⚠️ Error al validar el código desde la URL.';
                    msg.style.color = 'red';
                }
            }
            });

        </script>
        </body>
        </html>
    `;
    res.send(html);
  } catch (error) {
    console.error('Error al obtener registros:', error);
    res.status(500).send('Error al obtener registros');
  }
});

/**
 * ruta para actualizar un registro existente con la AppKey
 */
router.post('/', express.urlencoded({ extended: true }), async (req, res) => {
    const { codigo, clave } = req.body;
    const urlExterna = process.env.URL_ALERTZY;
    const message = `El alumno ${clave} ha sido asociado a su cuenta con exito!`;
    const accountKey = codigo
    const title = 'Registro exitoso';

    try {
        pool.query('UPDATE usuarios SET alertzy_key = ? WHERE alumno = ?', [codigo, clave]);

        const sendPush = await axios.post(
        urlExterna,
        {accountKey, title, message},
        { headers: { 'Content-Type': 'application/json' } }
        );

        const {data} = sendPush;

        if (data.response === 'success') {
        respuesta = {success: true};
        estatusCode = 200;
        } 
    } catch (err) {
        console.warn('No se pudo hacer la petición externa:', err.message);
        return res.status(400).json({ error: true, msg: err.message });
    }
    res.send(`<h1>El alumno ${clave} ha sido asociado a su cuenta con exito!</h1><br><br><h3>Ya puede cerrar esta pagina</h3>`).status(200);
});

router.post('/searchUid', async (req, res) => {
    const { code } = req.body;

    if (!code) return res.status(400).json({ error: 'Falta el parámetro "code"' });

    try {
        const [usuario] = await pool.query('SELECT * FROM usuarios WHERE codigo = ?', [code]);
        if (usuario.length === 0) return res.status(404).json({ error: 'Alumno no encontrado' });
        const {alumno} = usuario[0];
        res.status(200).json({ success: true, name: alumno});
    } catch (error) {
        console.error('Error al obtener registros:', error);
        res.status(500).send('Error al obtener registros');
    }
});

router.post('/validateAppKey', async (req, res) => {
    const { key, codigo } = req.body;
    let respuesta = {error: true, msg: 'Clave de App no válida!'};
    let estatusCode = 400;
    if (!key || !codigo) return res.status(400).json({ error: 'Faltan parametros' });

    try {
        const [usuario] = await pool.query('SELECT * FROM usuarios WHERE codigo = ?', [codigo.toLowerCase()]);

        if (usuario.length === 0) return res.status(404).json({ error: 'Alumno no encontrado' });

        const {alertzy_key, alumno} = usuario[0];

        if (alertzy_key) {
            console.log('si tiene clave gurdada');
            return res.status(400).json({ error: true, msg: 'El Alumno ya esta registrado con otra cuenta' });
        }

        const urlExterna = process.env.URL_ALERTZY;
        const message = 'Hemos validado su cuenta, ya puede seguir con el registro!';
        const accountKey = key
        const title = 'Cuenta válida';
    
        try {
          const sendPush = await axios.post(
            urlExterna,
            {accountKey, title, message},
            { headers: { 'Content-Type': 'application/json' } }
          );
          const {data} = sendPush;
          if (data.response === 'success') {
            respuesta = {success: true};
            estatusCode = 200;
          } 
        } catch (err) {
            console.warn('No se pudo hacer la petición externa:', err.message);
            return res.status(400).json({ error: true, msg: err.message });
        }

        res.status(estatusCode).json(respuesta);
    } catch (error) {
        console.error('Error al obtener registros:', error);
        res.status(500).send('Error al obtener registros');
    }    
});

module.exports = router;
