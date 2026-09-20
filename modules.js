document.querySelectorAll('[data-action="register"]').forEach(btn=>btn.addEventListener('click',()=>{btn.textContent='✓ Registrado';btn.classList.add('secondary');btn.disabled=true;}));
document.querySelectorAll('[data-action="confirm"]').forEach(btn=>btn.addEventListener('click',()=>{btn.textContent='✓ Confirmado';btn.classList.add('secondary');btn.disabled=true;}));
