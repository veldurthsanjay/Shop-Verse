let form=document.getElementById('send').addEventListener('click',(e)=>{
    e.preventDefault();
        let name=document.getElementById('names').value;
        if(name===''){
           document.getElementById('nameerror').textContent='name is required'
           document.getElementById('nameerror').style.color='red';
           document.getElementById('names').setAttribute('style','border:1px solid red')
        }
        else{
           document.getElementById('nameerror').textContent = '';
           document.getElementById('names').setAttribute('style','border:"')
        } 
        let email=document.getElementById('email').value;
        let emailPattern=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailPattern.test(email)){
         document.getElementById('emailerror').textContent='please enter a valid email address'
         document.getElementById('emailerror').style.color='red';
         document.getElementById('email').setAttribute('style','border:1px solid red')
        }
        else{
         document.getElementById('emailerror').textContent = '';
         document.getElementById('email').style.border="";
        }
     let msg=document.getElementById('msg').value;
      if(msg===''){
        document.getElementById('errormsg').textContent='Enter Some message';
        document.getElementById('errormsg').setAttribute('style','color:red')
        document.getElementById('msg').setAttribute('style','border:1px solid red')
      }
      else{
        document.getElementById('errormsg').textContent = '';
        document.getElementById('msg').style.border="";
      }
      if(name!="" && email!="" && msg!="" ){
        document.querySelector('.form').reset();
        setTimeout(() => {
          alert("Form Submitted Successfully");
        }, 500);
      }
})
