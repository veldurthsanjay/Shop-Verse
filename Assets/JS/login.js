 let loginbtn=document.getElementById('loginbtn').addEventListener('click',(e)=>{
    e.preventDefault();
    let email=document.getElementById('email').value;
    let emailpattern=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailpattern.test(email)){
        document.getElementById('emailerr').textContent='Enter Email Address';
        document.getElementById('emailerr').setAttribute('style','color:red');
        document.getElementById('email').setAttribute('style','border:1px solid red')
    }
    else{
        document.getElementById('emailerr').textContent='';
        document.getElementById('email').setAttribute('style','border:')
    }

    let password=document.getElementById('pswd').value;
    let pswdpattern=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if(!pswdpattern.test(password)){
        document.getElementById('pswderr').textContent='Enter Password';
        document.getElementById('pswderr').setAttribute('style','color:red')
        document.getElementById('pswd').setAttribute('style','border:1px solid red')
    }
    else{
        document.getElementById('pswderr').textContent='';
        document.getElementById('pswd').setAttribute('style','border:')
    }

    if(email!=='' && password!==''){
        document.querySelector('.form').reset();
        setTimeout(() => {
         alert('Form Submitted Successfully');
            
        }, 500);
    }
})  

