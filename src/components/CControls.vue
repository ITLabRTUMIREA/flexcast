<template>
  <div class="c-controls">
    <div class="row instruments">
      <div
        class="button noselect"
        :class="getInstrumentClass('mouse')"
        @click="selectInstrument('mouse')"
      >
        <img src="icons/cursor.svg">
      </div>
      <div
        class="button noselect"
        :class="getInstrumentClass('move')"
        @click="selectInstrument('move')"
      >
        <img src="icons/arrows.svg">
      </div>
      <div
        class="button noselect"
        :class="getInstrumentClass('remove')"
        @click="selectInstrument('remove')"
      >
        <img src="icons/eraser.svg">
      </div>
      <div class="button noselect" @click="automerge">
        <img src="icons/blocks.svg">
      </div>
    </div>
    <div class="row">
      <div class="button noselect" @click="buttonBegin">
        <img src="icons/begin.svg">
      </div>
      <div class="button noselect" @click="buttonBackward">
        <img src="icons/backward.svg">
      </div>
      <div class="button play noselect" @click="togglePlay">
        <template v-if="isPlaying">
          <img src="icons/pause.svg">
        </template>
        <template v-else>
          <img src="icons/play.svg">
        </template>
      </div>
      <div class="button noselect" @click="buttonForward">
        <img src="icons/forward.svg">
      </div>
      <div class="button noselect" @click="buttonEnd">
        <img src="icons/end.svg">
      </div>
    </div>
    <div class="row">
      <div class="button noselect">
        <img src="icons/volumemin.svg" height="25px">
      </div>
      <div class="slidecontainer">
        <input
          type="range"
          v-model="volume"
          min="0"
          max="100"
          value="20"
          class="slider"
          @input="volumeChanged"
        >
      </div>
      <div class="button noselect">
        <img src="icons/volumemax.svg">
      </div>
    </div>
    <div class="row">
      <div class="button noselect">
        <img src="icons/lowscale.svg">
      </div>
      <div class="slidecontainer">
        <input type="range" v-model="zoom" min="1" max="200" class="slider" @input="zoomChanged">
      </div>
      <div class="button noselect">
        <img src="icons/highscale.svg">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/play';
import 'vue-awesome/icons/pause';

import { InstrumentType } from '@/model/managers/InstrumentManager';

@Component({
  components: {
    Icon
  }
})
export default class CControls extends Vue {
  private instrument: InstrumentType = 'mouse';
  private isPlaying: boolean = false;

  private zoom: number = 20;
  private volume: number = 20;

  created() {
    this.$bus.on('playPause', this.updateState);
    this.$bus.on('instrumentChanged', this.updateState);
    this.updateState();
  }

  togglePlay() {
    const isReady = this.$state.sampleManager.samples.every(
      (sample) => sample.isComplete
    );

    this.isPlaying = !this.isPlaying;
    this.$state.timelineManager.isPlaying = this.isPlaying;
  }

  updateState() {
    this.isPlaying = this.$state.timelineManager.isPlaying;
    this.instrument = this.$state.instrumentManager.instrument;
  }

  volumeChanged(value: Number) {
    this.volume = Number(this.volume);
    this.$state.timelineManager.volume = this.volume / 100;
  }

  zoomChanged(value: Number) {
    this.zoom = Number(this.zoom);
    this.$state.timelineManager.pps = this.zoom;
  }

  buttonBackward() {
    const seconds = this.$state.timelineManager.time;

    const leftOrigins = this.$state.sampleManager.samples
      .map((v) => {
        return seconds - v.offset;
      })
      .filter((v) => v > 0)
      .sort((a, b) => {
        if (a == b) {
          return 0;
        }

        return a < b ? -1 : 1;
      });

    if (leftOrigins.length == 0) {
      this.buttonBegin();
      return;
    }

    this.$state.timelineManager.time = seconds - leftOrigins[0];
    this.$state.timelineManager.scrollToCursor();
  }

  buttonForward() {
    const seconds = this.$state.timelineManager.time;

    const rightEnds = this.$state.sampleManager.samples
      .map((v) => {
        return v.offset + v.duration - seconds;
      })
      .filter((v) => v > 0)
      .sort((a, b) => {
        if (a == b) {
          return 0;
        }

        return a < b ? -1 : 1;
      });

    if (rightEnds.length == 0) {
      this.buttonEnd();
      return;
    }

    this.$state.timelineManager.time = rightEnds[0] + seconds;
    this.$state.timelineManager.scrollToCursor();
  }

  buttonBegin() {
    this.$state.timelineManager.time = 0;
    this.$state.timelineManager.scrollToCursor();
  }

  buttonEnd() {
    this.$state.timelineManager.time = this.$state.sampleManager.maxTime;
    this.$state.timelineManager.scrollToCursor();
  }

  automerge() {
    this.$state.sampleManager.mergeSamples();
  }

  selectInstrument(type: InstrumentType) {
    this.$state.instrumentManager.instrument = type;
    this.$forceUpdate();
  }

  getInstrumentClass(type: InstrumentType) {
    return {
      active: this.instrument === type
    };
  }
}
</script>

<style lang="scss">
$controls-height: 30px;

.c-controls {
  background-color: #03282d;

  .row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    &.instruments {
      background-color: #021d20;

      .button {
        margin: 0;
        width: 40px;
        padding: 5px;
      }

      .active {
        background-color: #010c0e;
      }
    }
  }

  .button {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: $controls-height;
    padding: 5px;

    img {
      width: auto;
      min-height: 100%;
    }

    &.play {
      height: 50px;
    }

    &:hover,
    &.active {
      cursor: pointer;
    }
  }

  .slidecontainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0px 5px;

    .slider {
      margin: 0;
      -webkit-appearance: none;
      appearance: none;
      height: 5px;
      background-color: #0b4e51;
      border: 1px solid #24dbcc;
      outline: none;
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-image: radial-gradient(78% 150%, #9cefff 50%, #023637 100%);
        border: 2px solid rgba(100, 180, 186, 0.85);
        cursor: pointer;
      }

      &::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-image: radial-gradient(78% 150%, #9cefff 50%, #023637 100%);
        border: 2px solid rgba(100, 180, 186, 0.85);
        cursor: pointer;
      }
    }
  }
}
</style>
