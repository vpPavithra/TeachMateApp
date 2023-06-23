import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Response } from '../response';
import { IonContent, IonPopover } from '@ionic/angular';
import { Media, MediaObject } from '@awesome-cordova-plugins/media/ngx';
import { File, IWriteOptions } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { PrintOptions, Printer } from "@awesome-cordova-plugins/printer/ngx";
enum Creator {
  Me = 0,
  Bot = 1,
}
declare var cordova: any;
declare let window: any;
@Component({
  selector: 'app-content-details',
  templateUrl: './content-details.page.html',
  styleUrls: ['./content-details.page.scss'],
})
export class ContentDetailsPage implements OnInit {
  chapterName: string = ""
  contents: Array<any> = []
  loadingCtrl: any;
  query: any;
  qUrl: string = "";
  question: string = '';
  messages: Array<any> = [];
  selectedChip: any;
  disableSelect: boolean = true;
  details: any;
  userType: string = '';
  @ViewChild(IonContent, {static: true}) private content: any;
  quickActions: any = [];
  extraOptions = [{icon: "bulb", label: ""}, {icon: "ear", label: ""}, {icon: "add", label: "Quick Actions", id: 'trigger-button', quickActions: [{icon:"journal-outline", name: 'Teacher Aid'}, {icon:"print", name: 'print'}, {icon:"download", name: 'download'}]}, {icon: "chevron-back", label: ""}, {icon: "chevron-forward", label: ""}]
  @ViewChild(IonPopover) popover: IonPopover;
  @ViewChild(IonPopover) popoverhint: IonPopover;
  recording: boolean = false;
  startTimer: any
  pause: boolean = false
  fileName:any;
  filesPath: any;
  audio: MediaObject;
  base64: any;
  dataAudios: any;
  sanitizer: any;
  dataUpload: any;
  languages: Array<any>;
  selectedLanguage: any;
  NextMessageArray: any;
  nextMsg: any;
  headerMsg: any;
  constructor(
    private router: Router,
    private http: HttpClient,
    private media: Media,
    private androidPermissions: AndroidPermissions,
    private printer: Printer,
    private file: File,
    private diagnostic: Diagnostic,
    private fileOpener: FileOpener,
  ) {
    let data = this.router.getCurrentNavigation()?.extras?.queryParams;
    console.log(data, 'data');
    if (data) {
      this.contents = [];
      this.contents = data['content'];
      this.query = data['query'];
      this.chapterName = data['chapter'] || '';
      this.qUrl = data['query'].split(' ').join('%20');
      this.details = data['details']
      this.userType = data['role']
    }
    this.languages = [{name: "English", selected: false}, {name: "Hindi", selected: false}, {name: "Kannada", selected: false},  {name: "Telugu", selected: false}]
  }
  rx = /\d+\. [^\n]*/g;

  ngOnInit() {
  }

  languageSelected(lang: any) {
    this.languages.forEach(lan => {
      if(lang.name === lan.name && lan.selected) {
        this.selectedLanguage = lan.name;
        this.disableSelect = false;
      }
    })
  }

  ionViewWillEnter() {
    let ele = document.getElementById("hint")
    console.log('evenet ele', ele);
    ele.addEventListener("touchstart", () => {
      this.startRecording();
    });
  }

  // navigateToContentDetails(chip: any) {
  //   let quetionUrl;
  //   this.selectedChip = chip.type;
  //   this.disableSelect = true;
  //   this.contents.forEach(cont => {
  //     if (cont.type == chip.type) {
  //       cont.selected = (cont.type == chip.type) ? true : false;
  //       quetionUrl = cont.question.split(' ').join('%20')
  //       console.log(cont, 'cont');
  //     }
  //   });
  //   var uuid_number = this.details?.gradeLevel?.toLowerCase().includes('class 8') ? '4c67c7f4-0919-11ee-9081-0242ac110002' : '8800c6da-0919-11ee-9081-0242ac110002';
  //   let url = `${environment.questionGptUrl}?uuid_number=${uuid_number}&query_string=${quetionUrl}`;
  //   // let url = `${environment.questionGptUrl}=${quetionUrl}`;
  //   console.log(url, 'url');
  //   this.getData(url);
  // }

  // getData(url: any) {
  //   let msg = { text: '', from: Creator.Bot, innerHtml: false, htmltext:'' }
  //   this.messages.push(msg);
  //   this.http.get(url, { responseType: 'json' }).subscribe((res: any) => {
  //     console.log('res ', res);
  //     this.content.scrollToBottom(500);
  //     this.messages[this.messages.length-1].text = res && res.answer ? res['answer'] : "No Response";
  //     this.disableSelect = false;
  //     let arr: Array<string> = [];
  //     switch(this.selectedChip) {
  //       case "Quiz":
  //         arr = ["Practice Resource", "Practice Question Set"];
  //         break;
  //       case "Summary":
  //       case "Important Words":
  //         arr = ["Explanation Content"];
  //         break;
  //       case "Teacher Aid":
  //         arr = ["Teacher Resource"];
  //       break;
  //     }
  //     let msg = {text: '', from: Creator.Bot, innerHtml: true, htmltext:''}
  //     this.messages.push(msg);
  //     this.getContentDetails(arr).subscribe((data) => {
  //       console.log('teacherrrrrrrr', data)
  //       this.content.scrollToBottom(500);
  //       let output = `<div style="width: 100%; color: black"> <p>Here are courses which can help you learn more about this chapter:<p>`;
  //       let dataText = 'Here are courses which can help you learn more about this chapter'
  //       data.result.content.forEach(item => {
  //         output += `<p style="color: black"><a href='https://diksha.gov.in/explore-course/course/${item.identifier}'>${item.name}</a></p>`
  //         dataText += item.name
  //       });
  //       output +=`</div>`
  //       console.log('output', output);
  //       msg.htmltext = dataText;
  //       let id = 'chip'+ (this.messages.length - 1)
  //       let ele = document.getElementById(id);
  //       console.log(ele, 'ele');
  //       if (ele) {
  //         ele.innerHTML = output;
  //       }
  //     })
  //   })
  // }

  askQuestion() {
    if (this.selectedLanguage && this.question?.trim()) {
      this.nextMsg = "";
      let msg;
      console.log('height', document.body.scrollHeight);
      this.content.scrollToBottom(300);
      msg = { text: this.question, response:this.question, from: Creator.Me, innerHtml: false, htmltext:'' };
      this.messages.push(msg);
      this.disableSelect = true;
      console.log('this.details.gradeLevel',  this.details.gradeLevel)
      // var uuid_number = this.details?.gradeLevel?.toLowerCase().includes('class 8') ? '4c67c7f4-0919-11ee-9081-0242ac110002' : '8800c6da-0919-11ee-9081-0242ac110002';
      this.question = this.question.split(' ').join('%20');
      let url = `${environment.baseUrl}=${this.question}`;
      console.log('url is', url)
      this.question = "";
      msg = { text: "", response: '', from: Creator.Bot, innerHtml: false, htmltext:'' }
      this.messages.push(msg);
      console.log('before get')
      this.http.get(url, { responseType: 'text' }).subscribe((res: any) => {
        console.log('.....................', res)
          this.messages[this.messages.length - 1].text = res ? res : "No Response";
          this.messages[this.messages.length - 1].response = res ? res : "No Response";
          this.disableSelect = false;
          this.content.scrollToBottom(500);
      })
    }
  }

  getContentDetails(primaryCategories: Array<string>) {
    return this.http.post<Response>(environment.teacherBaseUrl, {
        "request": {
          "filters": {
            "primaryCategory": primaryCategories

          },
          "limit": 10,
          "query": this.chapterName,
          "sort_by": {
            "lastPublishedOn": "desc"
          },
          "fields": [
            "name",
            "identifier",
            "contentType"
          ],
          "softConstraints": {
            "badgeAssertions": 98,
            "channel": 100
          },
          "mode": "soft",
          "facets": [
            "se_boards",
            "se_gradeLevels",
            "se_subjects",
            "se_mediums",
            "primaryCategory"
          ],
          "offset": 0
        }
    });
  }

  async selectedOptions(option: any) {
    console.log('option ', option);
    switch(option.icon) {
      case "bulb":
        this.getMoreInfo();
        break;
      case "ear":
        this.readAloud();
        break;
      case "add":
        this.quickActions = option.quickActions;
        break;
      case "chevron-back":
        this.previousMsgData();
        break;
      case "chevron-forward":
        this.nextMsgData()
        break;
      }
  }

  getMoreInfo() {
    if (this.headerMsg) {
      let query = `Tell me more about ${this.headerMsg}`;
      let msg = { text: query, response: '', from: Creator.Me, innerHtml: false, htmltext:'' }
      this.messages.push(msg);
      query = query.split(' ').join('%20');
      let url = environment.baseUrl+'='+query;
      console.log('url ', url)
      this.handleApiCall(url)
    }
  }

  handleApiCall(url: any) {
    let msg;
    msg = { text: '', response: '', from: Creator.Bot, innerHtml: false, htmltext:'' };
    this.messages.push(msg);
    this.nextMsg = "";
    this.http.get(url, { responseType: 'text' }).subscribe((res: any) => {
      console.log('res ', res);
      this.disableSelect = false;
      if (res) {
        this.messages[this.messages.length-1].response = res;
        this.ModifyResponseForUI(res);
      } else {
        this.messages[this.messages.length-1].response = `No Response`
        this.messages[this.messages.length-1].text = this.messages[this.messages.length-1].response;
      }
    });
  }

  ModifyResponseForUI(test: any) {
    const data = Array.from(test.matchAll(this.rx)).filter((sentence: any) => sentence[0]).map((sentence: any) => `${sentence}`)
    const dataEx = test.split(this.rx)
    data[0] = dataEx[0]+data[0]
    data[data.length-1] +=dataEx[dataEx.length-1]

    const header = Array.from(data[0].matchAll(this.rx), (m) => m[0].split(":")[0].split('.')[1])
    console.log(header)
    
    this.NextMessageArray = data;
    this.nextMsg = data[0]
    this.headerMsg = header[0]
    this.messages[this.messages.length-1].text = data[0]
  }
  
  readAloud() {
    let text = this.messages[this.messages.length-1].innerHtml ? this.messages[this.messages.length-1].htmltext : this.messages[this.messages.length-1].text;
    console.log('text ', this.messages,  text.replace(/\d/g, ''));
    let body = {"controlConfig":{"dataTracking":true},"input":[{"source": text}],"config":{"gender":"female","language":{"sourceLanguage":"en"}}}
    this.http.post('https://demo-api.models.ai4bharat.org/inference/tts', body, {headers: {"content-type":"application/json"}, responseType:"json"})
    .subscribe((res: any) => {
      console.log('read aloud base64 data ', res);
      if(res?.audio[0]?.audioContent) {
        this.convertBase64toAudio(res)
      }
    })
  }

  convertBase64toAudio(data: any) {
    let src = `data:audio/${data.config.audioFormat};base64,` + data.audio[0].audioContent;
    console.log('src ', src);
    let snd = new Audio(src);
    console.log('snd ', snd);
    snd.play();
  }

  async handleAction(action: any) {
    console.log('action ', action);
    await this.popover.dismiss();
    switch(action.name) {
      case "print":
        this.handlePrint();
        break;
      case "Teacher Aid":
        this.getAPIforTeacherAid();
        break;
      case "download":
        this.downloadData();
        break;
    }
  }

  handlePrint() {
    let msg = this.messages[this.messages.length-1]
    let textmsg = msg.response ? msg.response : msg.innerHTML;
    let options: any = {
      font: {
          size: 22,
          italic: true,
          align: 'center',
          bold: false,
      },
      margin: true,
      header: {
          height: '6cm',
          label: {
              text: "ED-Saathi",
              font: {
                size: 37,
                italic: false,
                align: 'center',
                bold: true,
              },
          }
      }
    };
    this.printer.isAvailable().then(() => {
      this.printer.print(`${textmsg}`, options).then(() => {
        console.log("printing done successfully !");
      },() => {
        alert("Error while printing !");
      });
    }, (err) =>{
      alert('Error : printing is unavailable on your device '+ err);
    });
  }

  getAPIforTeacherAid() {
    let query = `Teacher aid with simple examples done in the classroom to teach ${this.chapterName}`;
    let msg = { text: `Teacher aid - ${this.chapterName}`, response: `Teacher aid - ${this.chapterName}`, from: Creator.Me, innerHtml: false, htmltext:'' }
    this.messages.push(msg);
    query = query.split(' ').join('%20');
    let url = environment.baseUrl+'='+query;
    console.log('url ', url)
    this.handleApiCall(url);
  }

  downloadData() {
    let msg = this.messages[this.messages.length-1]
    let textmsg = msg.rersponse ? msg.response : msg.innerHTML;
    console.log('download data');
    const directory = this.file.externalDataDirectory;
    const fileName = 'user-data.pdf';
    const permissionsArray = [
      this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
      this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
    ]
    this.androidPermissions
      .requestPermissions(permissionsArray)
      .then((successResult) => {
        console.log('android permissions data');
        if (successResult.hasPermission) {
          let options: IWriteOptions = {
            replace: true,
          };
          this.file
            .checkFile(directory, fileName)
            .then((res) => {
              console.log('file check ', res)
              this.file
              .writeFile(directory, fileName, textmsg, options)
              .then((res) => {
                console.log('File generated' + JSON.stringify(res));
                this.fileOpener
                  .open(res.nativeURL, 'application/pdf')
                  .then(() => console.log('File is exported'))
                  .catch((e) => {console.log(e)
                    alert('Error'+e?.message)
                  });
              })
              .catch((error) => {
                console.log(JSON.stringify(error));
              });
            })
            .catch((error) => {
              console.log('fiel ccheck erroe ')
              this.file
                .writeFile(cordova.file.externalDataDirectory, fileName, textmsg)
                .then((res) => {
                  console.log('File generated' + JSON.stringify(res));
                  this.fileOpener
                    .open(res.nativeURL, 'application/pdf')
                    .then(() => console.log('File exported'))
                    .catch((e) => {console.log(e) 
                      alert('Error'+e?.message)});
                })
                .catch((error) => {
                  console.log(JSON.stringify(error));
                });
            });
        }
      }).catch(err => {
        console.log('android permissions error');
      })
  }

  previousMsgData() {
    let lastmsg = this.messages[this.messages.length-1];
    if (lastmsg.from == Creator.Bot && lastmsg.text && lastmsg.text !== 'No Response') {
      let index: number = 0
      console.log('on prev ', this.nextMsg)
      this.NextMessageArray.forEach((nxt: any, i: any) => {
        if(nxt === this.nextMsg) {
          console.log('prev index ', i);
          index = i-1;
        }
      })
      if (index >= 0) {
        lastmsg.text = ''
        this.NextMessageArray.forEach((nxt: any, i: any) => {
          if(i <= index) {
            this.nextMsg = nxt;
            this.headerMsg = Array.from(this.nextMsg.matchAll(this.rx), (m: any) => m[0].split(":")[0].split('.')[1])
            lastmsg.text += '\n' + nxt
          }
        })
      }
    }
  }

  nextMsgData() {
    let lastmsg = this.messages[this.messages.length-1];
    if (lastmsg.from == Creator.Bot && lastmsg.text && lastmsg.text !== 'No Response') {
      let index: number = 0
      console.log('on next ', this.nextMsg)
      this.NextMessageArray.forEach((nxt: any, i: any) => {
        if(nxt === this.nextMsg) {
          index = i;
          this.nextMsg = "";
        }
      })
      if (this.NextMessageArray[index+1]) {
        this.nextMsg = this.NextMessageArray[index+1]
        this.headerMsg = Array.from(this.nextMsg.matchAll(this.rx), (m: any) => m[0].split(":")[0].split('.')[1])
        lastmsg.text += '\n' + this.nextMsg
      }
    }
  }

  recordSpeech(e: any) {
    (window as any).Keyboard.hide();
    this.ionViewWillEnter()
    console.log('record ', e)
  }

  async closeHintPopover(e: any) {
    await this.popoverhint.dismiss();
  }

  checkRecordMediaPermission() {
    this.diagnostic
      .isMicrophoneAuthorized()
      .then((success) => {
        this.diagnostic
          .requestMicrophoneAuthorization()
          .then((success) => {
            if (success === "authorized" || success === "GRANTED") {
              const permissionsArray = [
                this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
                this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
                this.androidPermissions.PERMISSION.RECORD_AUDIO,
              ];
              this.androidPermissions
                .requestPermissions(permissionsArray)
                .then((successResult) => {
                  successResult.hasPermission
                    ?? this.startRecording()
                })
                .catch((error) => {
                  // this.toast.openToast(
                  //   "Please accept the permissions to use this feature"
                  // );
                });
            } else {
              // this.toast.openToast(
              //   "Please accept the permissions to use this feature"
              // );
            }
          })
          .catch((error) => {
            console.log("Please accept the permissions to use this feature");
          });
      })
  }
  timerId: any;
  async startRecording() {
    this.checkRecordMediaPermission();
    this.recording = true;
    console.log('start recording')
    var counter1 = 0;
    let cnt2 = 0;
    let cnt3 = 0;
    this.timerId = setInterval(() => {
      counter1++;
      if (counter1 > 0 && counter1<=59) {
        let span = document.getElementById("timer");
        span.innerHTML = cnt3 + ':' + cnt2 + ':' + counter1;
      } else {
        counter1 = 0;
        cnt2++;
        if(cnt2 > 59) {
          cnt2 = 0;
          cnt3++;
        }
      }
    }, 1000);
    this.file
    .checkDir(this.file.externalDataDirectory, "audio")
    .then((success) => {
      console.log('file checck success ', success);
      this.fileName =
        "record" +
        new Date().getDate() +
        new Date().getMonth() +
        new Date().getFullYear() +
        new Date().getHours() +
        new Date().getMinutes() +
        new Date().getSeconds() +
        ".wav";
      this.filesPath =
        this.file.externalDataDirectory + "audio/" + this.fileName;
      this.audio = this.media.create(this.filesPath);
      console.log('audio ', this.audio);
      this.audio.startRecord();
      let duration = this.audio.getDuration();
      console.log('duration ', duration);
    })
    .catch((err) => {
      console.log('file check error ', err);
      this.file.createDir(cordova.file.externalDataDirectory, "audio", false)
      .then(
        (success) => {
          console.log('file create success ', success);
          this.fileName =
            "record" +
            new Date().getDate() +
            new Date().getMonth() +
            new Date().getFullYear() +
            new Date().getHours() +
            new Date().getMinutes() +
            new Date().getSeconds() +
            ".wav";
          this.filesPath =
            this.file.externalDataDirectory + "audio/" + this.fileName;
          
            console.log('file path ', this.filesPath);
          this.audio = this.media.create(this.filesPath);
          this.audio.startRecord();
          let duration = this.audio.getDuration();
          console.log('duration 1 ', duration);
        },
        (error) => { 
          console.log('file create error ', error);
        }
      );
      })
  }

  async stopRecording() {
    this.recording = false;
    console.log('stop recording ', this.audio);
    clearInterval(this.timerId);
    this.audio.stopRecord();
    let duration = this.audio.getDuration();
    console.log('duration 2 ', duration);
    this.audio.play();
    this.audio.release();
    // this.file.readAsDataURL(this.file.externalDataDirectory + "audio/", this.fileName)
    // .then((base64Audio) => {
    //   console.log('base64 audio ', base64Audio);
    // })
    // .catch(function (err: TypeError) {
    //   console.log("readAsDataURL: " + err);
    // });

    let res = await this.file.readAsDataURL(this.file.externalDataDirectory + "audio/", this.fileName)
    console.log('base64 string ', res);
    // var x = res.substr(13,res.length);
    // x = "data:audio/mpeg;base64" + x;
    // console.log('x ', x)
    this.getStringFormAPI(res);
    // let reader = new FileReader();
    // reader.readAsDataURL(this.fileName);
    // reader.onload = () => {
    //   let base64 = reader.result // Here is your base64.
    //   console.log('base64 strr ', base64);
    // }
  }

  getStringFormAPI(base64Audio: any) {
    let myHeaders = new HttpHeaders();
    myHeaders.append("Content-Type", "application/json");
    let payload = JSON.stringify({
      config: {
        language: {
          sourceLanguage: this.selectedLanguage ? this.selectedLanguage : 'English',
        },
        transcriptionFormat: {
          value: "transcript",
        },
        audioFormat: "wav",
        samplingRate: 30000,
        postProcessors: null,
      },
      audio: [
        {
          audioContent: base64Audio,
        },
      ],
    });
    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: payload,
      redirect: "follow",
    };
    // fetch('https://asr-api.ai4bharat.org/asr/v1/recognize/en', requestOptions).then(response => console.log(response))
    this.http.post('https://asr-api.ai4bharat.org/asr/v1/recognize/en', payload, {headers:myHeaders, responseType: 'json' }).
    subscribe((res: any) => {
      console.log('api response', res)
    })
  }

  pauseRecording() {
    this.pause = true
    this.audio.pauseRecord();
    console.log('pause recording')
  }

  resumeRecording() {
    this.pause = false;
    this.audio.resumeRecord();
  }
  
  deleteRecording() {
    this.recording = false;
    console.log('delete recording');
  }
}
