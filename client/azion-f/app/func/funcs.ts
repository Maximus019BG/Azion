import Cookies from 'js-cookie';

//Checks if user has MFA
const CheckMFA = async (onMFAPage:boolean) =>{
    const email:string|undefined = Cookies.get('Azion_email');
    const toCheck:string|undefined = Cookies.get('mfaChecked'+ email);
    if(onMFAPage){
      if(toCheck === 'true') {
        window.location.href = '/organizations';
      }
      else {
      return;
      }
    }
    else if(!onMFAPage){
      if(toCheck === 'true') {
        return;
      }
      else {
        window.location.href = '/mfa';
      }
    }
  }

//!FOR TESTING PURPOSES ONLY!
const DelCookie = () =>{
    Cookies.remove('mfaChecked');
}


export {CheckMFA, DelCookie};