import Cookies from 'js-cookie';

//Checks if user has MFA
const CheckMFA = async (onMFAPage:boolean) =>{
    if(onMFAPage){
      if(Cookies.get('mfaChecked') === 'true') {
        window.location.href = '/organizations';
      }
      else {
      return;
      }
    }
    else if(!onMFAPage){
      if(Cookies.get('mfaChecked') === 'true') {
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