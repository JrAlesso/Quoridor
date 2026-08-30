    document.getElementById('btn-online').addEventListener('click', function() {
      if (!currentUser) { alert('Faça login primeiro.'); return; }
      document.getElementById('sala-overlay').classList.add('show');
      document.getElementById('sala-status').textContent = 'Escolha uma opção:';
      document.getElementById('sala-lista').innerHTML = '';
      document.getElementById('sala-id-input').value = '';
      document.getElementById('sala-senha-input').value = '';
      setupSalaEventListeners();
    });
