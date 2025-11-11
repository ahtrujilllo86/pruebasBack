let paramCode;

const validateCode  = async ()=> {
    const codigoVal = document.getElementById('codigo').value.trim();
    msgCodigo.textContent = '';
    console.log(codigoVal);

    if (!codigoVal) {
    msgCodigo.textContent = '⚠️ Ingresa el código recibido.';
    msgCodigo.style.color = 'red';
    return;
    }

    msgCodigo.textContent = 'Validando código...';
    msgCodigo.style.color = '#333';

    try {
    const res = await fetch('http://localhost:3000/validations/validateAppKey', {
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
    console.log(err);
    msgCodigo.textContent = '⚠️ Error de conexión.';
    msgCodigo.style.color = 'red';
    }
};


const init  = async (code)=> {
    const msg = document.getElementById('msg');
    const msgCodigo = document.getElementById('msgCodigo');
    const registrarBtn = document.getElementById('registrarBtn');
    const clave = document.getElementById('clave');
    const codigo = document.getElementById('codigo');
    const validarCodigoBtn = document.getElementById('validarCodigoBtn');

    if (!code) {
        clave.value = 'Si informacion de alumno';
        return;
    }

    if (code) {
        try {
            const res = await fetch('http://localhost:3000/validations/searchUid', {
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
            msg.textContent = '⚠️ Error al validar el código desde la URL.';
            msg.style.color = 'red';
        }
    }

};
