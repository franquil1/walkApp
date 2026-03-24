const txtPuntaje = document.querySelector("#puntos");
const nombre = document.querySelector("#nombre");
const nombreJugador = document.querySelector("#nombre-jugador");

nombre.innerHTML = localStorage.getItem("nombre");
nombreJugador.innerHTML = localStorage.getItem("nombre");

let puntajeTotal = 0;
if(!localStorage.getItem("puntaje-total")){
    puntajeTotal = 0;
    txtPuntaje.innerHTML = puntajeTotal
}else{
    puntajeTotal = parseInt(localStorage.getItem("puntaje-total"));
    txtPuntaje.innerHTML = puntajeTotal;
}

let categoriasJugadas;

const categoriasJugadasLS = JSON.parse(localStorage.getItem("categorias-jugadas"));
if(categoriasJugadasLS){
    categoriasJugadas = categoriasJugadasLS;
}else{
    categoriasJugadas = [];
}
console.log(categoriasJugadas);

function agregarEventListenerOpciones(){
    const categorias = document.querySelectorAll(".categoria");
    categorias.forEach(categoria => {
        categoria.addEventListener("click", (e) => {
            const idCategoria = e.currentTarget.id;
            const urlDestino = e.currentTarget.dataset.url;

            localStorage.setItem("categoria-actual", idCategoria);

            let categoriasJugadas = JSON.parse(localStorage.getItem("categorias-jugadas")) || [];
            if (!categoriasJugadas.includes(idCategoria)) {
                categoriasJugadas.push(idCategoria);
                localStorage.setItem("categorias-jugadas", JSON.stringify(categoriasJugadas));
            }

            location.href = urlDestino;
        });
    });

    // Desactivar categorías ya jugadas
    const categoriasJugadas = JSON.parse(localStorage.getItem("categorias-jugadas")) || [];
    categorias.forEach(categoria => {
        if (categoriasJugadas.includes(categoria.id)) {
            categoria.classList.add("desabilitada", "no-events");
        }
    });
}
agregarEventListenerOpciones();