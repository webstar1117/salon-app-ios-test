import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, NavParams, ToastController, Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-imagemodal',
  templateUrl: './imagemodal.page.html',
  styleUrls: ['./imagemodal.page.scss'],
})


export class ImagemodalPage implements OnInit {

  avatarUrl: any;
  hasImage: boolean = false;
  image: any = [];
  type: any;
  apiUrl = 'https://hairday.app/api/';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  optionsForCamera: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    sourceType: this.camera.PictureSourceType.CAMERA,
    correctOrientation: true,
  }
  optionsForPhotoFile: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
  }


  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private camera: Camera,
    public actionSheetController: ActionSheetController,
    private platform: Platform,

  ) { }

  ngOnInit() {
    var avatar = this.navParams.get('avatar');
    this.type = this.navParams.get('type');
    if (avatar != null) {
      if (this.type == 'profile') {
        this.avatarUrl = 'https://hairday.app/assets/images/avatars/' + avatar;
        this.hasImage = true;
      } else {
        this.readFile(avatar);
      }
    } else {
      this.avatarUrl = 'assets/imgs/noImage.png';
    }
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select',
      cssClass: 'my-custom-class',
      animated: true,
      mode: !this.platform.is('ios') ? "md" : "ios",
      buttons: [{
        text: 'Camera',
        role: 'destructive',
        icon: 'camera',
        handler: () => {
          this.cameraImage();
        }
      }, {
        text: 'Photos',
        icon: 'image',
        handler: () => {
          this.photoFile();
        }
      }],

    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role and data', role, data);
  }

  cameraImage() {
    this.camera.getPicture(this.optionsForCamera).then((imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.avatarUrl = base64Image;
      this.hasImage = true;
      this.image=base64Image;
    }, (err) => {

      console.log(err);

    });
  }
  
  photoFile() {
    this.camera.getPicture(this.optionsForPhotoFile).then((imageData) => {  
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.avatarUrl = base64Image;
      this.hasImage = true;
      this.image=base64Image;
    }, (err) => {
      console.log(err);
    });
  }


  readFile(data) {
    let reader = new FileReader();
    const file = data;
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.image = _event.target.result;
      this.avatarUrl = file.name;
      this.hasImage = true;
    }
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });    
    return blob;
 }
 

  nextStep() {
    const filename = 'hairday_profile_images_new.jpeg'
    const blobdata = this.dataURItoBlob(this.image)
    const imageData = new File([blobdata], filename, { type: 'image/jpeg' });
    if (this.type == 'profile') {
      if (this.image == undefined) {
        this.toastMessage('Please upload profile image');
      } else {
        let formData = new FormData();
        formData.append("api_token", localStorage.getItem('token'));
        formData.append("image", imageData);

        this.http.post(this.apiUrl + "profile/change-image", formData)
          .subscribe(res => {
            console.log('res')
            if (res["status"] == 200) {
              this.toastMessage(res["message"]);
              this.modalCtrl.dismiss();
            } else {
              for (let key in res["message"]) {
                this.toastMessage(res["message"][key]);
              }
            }
          }, (err) => {
            console.log(err);
          });
      }
    } else if (this.type == 'business' || this.type == 'professional' || this.type == "portfolio" || this.type == "review") {
      this.modalCtrl.dismiss({ avatar: imageData, avatarUrl: this.image });
    } else if (this.type == 'salon') {
      var salon_id = this.navParams.get('salon_id');
      if (this.image == undefined) {
        this.toastMessage('Please upload salon image');
      } else {
        let formData = new FormData();
        formData.append("salon_id", salon_id);
        formData.append("image", imageData);
        this.http.post(this.apiUrl + "business/upload-business-image", formData)
          .subscribe(res => {
            if (res["status"] == 200) {
              this.toastMessage(res["message"]);
              this.modalCtrl.dismiss();
            } else {
              if (Array.isArray(res["message"])) {
                for (let key in res["message"]) {
                  this.toastMessage(res["message"][key]);
                }
              } else {
                this.toastMessage(res["message"]);
              }
            }
          }, (err) => {
            console.log(err);
          });
      }
    }
  }

  close() {
    this.modalCtrl.dismiss({ avatar: null });
  }

  async toastMessage(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      cssClass: 'ion-text-center',
      duration: 2000
    });
    toast.present();
  }

}
