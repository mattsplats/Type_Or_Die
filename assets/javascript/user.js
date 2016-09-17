"use strict"; 

// Stats processing and storage
const user = {
  // User info
  name: null,
  email: null,


};

$("#auth").on('click', function() {
  // First, we perform the signInWithRedirect.
  // Creates the provider object.
  var auth = firebase.auth()
  var provider = new firebase.auth.GoogleAuthProvider();

  // You can add additional scopes to the provider:
  provider.addScope('email');

  // Sign in with redirect:
  auth.signInWithPopup(provider).then(function(result) {
    // The firebase.User instance:
    user.name = result.user.displayName;
    user.email = result.user.email;
    
    firebase.database.ref("users/" + user.email).set({
      name: user.name,
      email: user.email
    });

  }, function(error) {
    throw error;
  });
});