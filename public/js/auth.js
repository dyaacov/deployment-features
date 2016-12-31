function doLogin(){
    localStorage.setItem('deploymentFeatures.isAdmin', true);
    window.location = window.location.origin;
}