// logica_historial.js

const HISTORIAL_TRABAJOS = [
    {
        id: 101,
        fecha: "Diciembre 2025",
        titulo: "Mantención Subida",
        descripcion: "Aplicación de ripio y compactación mecánica en el tramo subida.",
        costoTotal: 2290000,
        cuotaIndividual: 55854
    }
];

// logica_historial.js

/**
 * Formatea valores a moneda chilena (CLP)
 */
const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(value);
};

/**
 * Control de apertura y cierre del acordeón
 */
window.toggleTrabajo = (id) => {
    const content = document.getElementById(`content-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
};

/**
 * Renderiza el Historial de Obras
 */
const renderHistorial = () => {
    const container = document.getElementById('historial-container');
    
    // Validación de seguridad para parcelasData
    if (typeof parcelasData === 'undefined') {
        container.innerHTML = `<div class="p-4 text-amber-800 bg-amber-50 rounded-lg border border-amber-200">Error: No se encontró la fuente de datos 'parcelasData'.</div>`;
        return;
    }

    // 1. CÁLCULO FINANCIERO DINÁMICO
    // Sumamos (multiplicador_cuota o 1) solo para los que tienen paga_cuota_Camino: true
    const totalCuotasRecaudadas = parcelasData
        .filter(p => p.paga_cuota_Camino)
        .reduce((total, p) => total + (p.multiplicador_cuota || 1), 0);

    const propietariosPagadosCount = parcelasData.filter(p => p.paga_cuota_Camino).length;

    // 2. ORDENAMIENTO DE LISTA
    // Primero los que pagaron (true), luego los pendientes (false)
    const propietariosOrdenados = [...parcelasData].sort((a, b) => b.paga_cuota_Camino - a.paga_cuota_Camino);

    // 3. GENERACIÓN DE INTERFAZ
    container.innerHTML = HISTORIAL_TRABAJOS.map(trabajo => {
        const recaudacionReal = totalCuotasRecaudadas * trabajo.cuotaIndividual;
        const diferencia = recaudacionReal - trabajo.costoTotal;
        const esDeficit = diferencia < 0;

        return `
        <div class="mb-6 overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
            
            <div onclick="toggleTrabajo('${trabajo.id}')" 
                 class="flex flex-col md:flex-row items-center justify-between bg-stone-50 p-5 md:px-8 cursor-pointer hover:bg-stone-100 transition-all">
                
                <div class="flex items-center gap-4">
                    <div id="icon-${trabajo.id}" class="transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div>
                        <span class="text-[9px] font-black uppercase tracking-widest text-amber-600 block mb-1">${trabajo.fecha}</span>
                        <h3 class="text-xl font-serif font-bold text-stone-800 leading-none">${trabajo.titulo}</h3>
                    </div>
                </div>

                <div class="mt-4 md:mt-0 bg-white border border-amber-100 px-6 py-3 rounded-xl shadow-sm">
                    <p class="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1 text-center md:text-right">Valor Recaudado Real vs Costo Total</p>
                    <div class="flex items-baseline gap-3 justify-center md:justify-end">
                        <span class="text-2xl font-bold text-emerald-700">${formatCurrency(recaudacionReal)}</span>
                        <span class="text-stone-300 font-light text-lg">/</span>
                        <span class="text-lg font-medium text-stone-500">${formatCurrency(trabajo.costoTotal)}</span>
                    </div>
                </div>
            </div>

            <div id="content-${trabajo.id}" class="hidden border-t border-stone-100 p-6 md:p-8 animate-fade-in">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div class="p-4 rounded-xl border ${esDeficit ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}">
                        <p class="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Diferencia de Fondos</p>
                        <p class="text-base ${esDeficit ? 'text-amber-800' : 'text-emerald-800'} font-semibold">
                            ${esDeficit ? 'Pendiente:' : 'Excedente:'} ${formatCurrency(Math.abs(diferencia))}
                        </p>
                    </div>
                    
                    <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 flex justify-between items-center">
                        <div>
                            <p class="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Participación</p>
                            <p class="text-xl font-bold text-stone-700">${totalCuotasRecaudadas} <span class="text-xs font-normal text-stone-400">Cuotas Pagadas</span></p>
                            <p class="text-[9px] text-stone-400 mt-0.5">De ${propietariosPagadosCount} propietarios</p>
                        </div>
                        <div class="text-right border-l border-stone-200 pl-4">
                            <p class="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Valor Cuota</p>
                            <p class="text-sm font-bold text-amber-700">${formatCurrency(trabajo.cuotaIndividual)}</p>
                        </div>
                    </div>
                </div>

                <p class="text-stone-600 text-sm mb-10 leading-relaxed italic border-l-2 border-amber-200 pl-4">
                    ${trabajo.descripcion}
                </p>

                <div class="space-y-4">
                    <h4 class="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-4">
                        Detalle de Aportes <span class="h-px bg-stone-100 flex-1"></span>
                    </h4>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        ${propietariosOrdenados.map(p => {
                            const multi = p.multiplicador_cuota || 1;
                            return `
                            <div class="flex items-center justify-between p-3 rounded-lg border transition-all ${p.paga_cuota_Camino 
                                ? 'border-emerald-100 bg-emerald-50/30' 
                                : 'border-stone-100 bg-stone-50/50 opacity-60'}">
                                <div class="overflow-hidden">
                                    <p class="text-[9px] font-black text-amber-600 truncate leading-none mb-1">${p.nro_parcela}</p>
                                    <p class="text-[10px] font-bold text-stone-700 truncate leading-tight">${p.nombre_propietario}</p>
                                </div>
                                <div class="flex flex-col items-end gap-1">
                                    ${p.paga_cuota_Camino && multi > 1 ? `<span class="bg-amber-100 text-amber-700 text-[8px] px-1 rounded font-black italic">x${multi}</span>` : ''}
                                    <div class="h-1.5 w-1.5 rounded-full ${p.paga_cuota_Camino ? 'bg-emerald-500' : 'bg-stone-300'}"></div>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
};

document.addEventListener('DOMContentLoaded', renderHistorial);