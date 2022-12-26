import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
declare var MediaRecorder: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  stream: any = null;
  audio: any = null;
  mixedStream: any = null;
  recorder: any = null
  startButton: boolean = false;
  stopButton: boolean = false;
  downloadButton: any = null;
  navigator = <any>navigator;
  myArray: any[] = [];
  @ViewChild("videoLive", {read: ElementRef}) videoLive: ElementRef | undefined;
  @ViewChild("videoPlayback", {read: ElementRef}) videoPlayback: ElementRef | undefined;
  @ViewChild("downloadVideo", {read: ElementRef}) downloadVideo: ElementRef | undefined;


  ngOnInit(): void {
    this.downloadButton = document.querySelector('.download-video');
  }

  async setupStream () {
    try {
      this.stream = await this.navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      this.audio = await this.navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      this.setupVideoFeedback();
    } catch (err) {
      console.error(err)
    }
  }

  setupVideoFeedback() {
    if (this.stream) {
      // @ts-ignore
      this.videoLive?.nativeElement.srcObject = this.stream;
      this.videoLive?.nativeElement.play();
    } else {
      console.warn('No stream available');
    }
  }

  async startRecording () {
    await this.setupStream();
    if (this.stream && this.audio) {
      this.mixedStream = new MediaStream([...this.stream.getTracks(), ...this.audio.getTracks()]);
      this.recorder = new MediaRecorder(this.mixedStream);
      this.recorder.ondataavailable = (e: { data: any; }) => {
        this.myArray.push(e.data)
      }
      this.recorder.start(200);
      this.startButton = true;
      this.stopButton = false;
    } else {
      console.warn('No stream available.');
    }
  }

  stopRecording () {
    this.recorder.stop();
    this.startButton = false;
    this.stopButton = true;
    this.handleStop();
  }

  handleStop () {
    const blob = new Blob(this.myArray, { 'type' : 'video/mp4' });
    this.myArray = [];
    // @ts-ignore
    this.downloadVideo?.nativeElement.href = URL.createObjectURL(blob);
    // @ts-ignore
    this.downloadVideo?.nativeElement.download = 'video.mp4'
    // @ts-ignore
    this.videoPlayback?.nativeElement?.src = URL.createObjectURL(blob);
    this.videoPlayback?.nativeElement.load();
    this.stream.getTracks().forEach((track: { stop: () => any; }) => track.stop());
    this.audio.getTracks().forEach((track: { stop: () => any; }) => track.stop());
  }

  playRecordedVideo(){
    this.videoPlayback?.nativeElement.play();
  }

  pauseRecordedVideo(){
    this.videoPlayback?.nativeElement.pause();
  }
}
