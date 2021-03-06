import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ImagemodalPage } from '../imagemodal/imagemodal.page';

@Component({
  selector: 'app-business',
  templateUrl: './business.page.html',
  styleUrls: ['./business.page.scss'],
})
export class BusinessPage implements OnInit {
  
  fname: string;
  lname: string;
  bname: string;
  btype: string;
  businessTypes: any;
  isSending: boolean = false;
  avatar: any;
  avatarUrl: any = 'assets/imgs/user.png';
  
  apiUrl = 'https://hairday.app/api/';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private http: HttpClient,
    private toastCtrl: ToastController) { }

  ngOnInit() {
    this.getBusinessType();
  }

  getBusinessType(){
    this.http.get(this.apiUrl+"business/set-up-business")
    .subscribe(res => {
      console.log(res);
      if(res["status"] == 200){
        this.businessTypes = res["data"];
      }
    }, (err) => {
      console.log(err);
    });
  }

  saveProfile(){
    if(this.fname == undefined){
      this.toastMessage('Please input first name');
    }else if(this.lname == undefined){
      this.toastMessage('Please input last name');
    }else if(this.bname == undefined){
      this.toastMessage('Please input business name');
    }else if(this.btype == undefined){
      this.toastMessage('Please select business type');
    }else if(this.avatar == undefined){
      this.toastMessage('Please upload profile image');
    }else{
      this.isSending = true;
      let formData = new FormData();
      formData.append("api_token", localStorage.getItem('token'));
      formData.append("first_name", this.fname);
      formData.append("last_name", this.lname);
      formData.append("name", this.bname);
      formData.append("business_type_id", this.btype);
      formData.append("logo", this.avatar);
  
      this.http.post(this.apiUrl+"business/add-name-and-image", formData)
        .subscribe(res => {
          this.toastMessage('res'+JSON.stringify(res));
          if(res["status"] == 200){
            this.toastMessage(res["message"]);
            this.navCtrl.navigateForward('businesssetup', {state: {salon_id: res["data"][0]}});
          }else{
            for(let key in res["message"]){
              this.toastMessage(res["message"][key]);
            }
            this.isSending = false;
          }
        }, (err) => {
          console.log(err);
          this.isSending = false;
        });
    }
  }

  async changeImage(){
    const modal = await this.modalCtrl.create({
      component: ImagemodalPage,
      componentProps: {avatar: this.avatar, type: "business"},
      cssClass: 'imagemodal',
      mode:'ios',
      swipeToClose:true,
      presentingElement: await this.modalCtrl.getTop()
    });

    modal.onDidDismiss()
    .then((data:any) => {
      this.avatar = data.data.avatar;
      this.avatarUrl = data.data.avatarUrl;
    });
    
    return await modal.present();
  }

  async toastMessage(msg){
    const toast = await this.toastCtrl.create({
      message: msg,
      cssClass: 'ion-text-center',
      duration: 2000
    });
    toast.present();
  }

}
