window.addEventListener("pageshow", function(event) {
    if (event.persisted || window.performance.navigation.type === 2) {
        // Handle page restore.
        window.location.reload();
    }
});