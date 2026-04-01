(() => {
  const textarea = document.querySelector('.aptChatTextarea[name="noiDung"]');
  const form = textarea?.closest('form');
  const msgs = document.getElementById('msgs');

  if (msgs) {
    msgs.scrollTop = msgs.scrollHeight;
  }

  if (textarea && form) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
  }
})();

