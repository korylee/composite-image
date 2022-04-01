<script  lang="tsx">
import CompositeImage from '../src';
import { defineComponent, onMounted, ref } from 'vue';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export default defineComponent({
  setup() {
    const img = new CompositeImage({
      bgSrc:
        'https://cdn1.keyouyun.com/3067/img/2022/0fa35ff43e73ea0b3fb59809ed158b6d.jpeg',
    });
    img
      .composite({
        text: '888',
        position: CompositeImage.CENTER,
        correctY: 120,
        font: '180px STXihei',
      })
      .composite({
        src: 'https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9hNmY2N2RiMWMyY2E3Mzc2OGI0MDY2NTVlMTdkMTFiZj9zaXplPTUwJmRlZmF1bHQ9cmV0cm8ifQ._kzxMzRQ34s0tzLOCZF6lrF3Mgd_5QliQdc4ocaR2ow',
        position: CompositeImage.UPPER_LEFT,
        width: 30,
        height: 30,
      })
      .composite({
        src: 'https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9hNmY2N2RiMWMyY2E3Mzc2OGI0MDY2NTVlMTdkMTFiZj9zaXplPTUwJmRlZmF1bHQ9cmV0cm8ifQ._kzxMzRQ34s0tzLOCZF6lrF3Mgd_5QliQdc4ocaR2ow',
        position: CompositeImage.UPPER_RIGHT,
        width: 30,
        height: 30,
      })
      .composite({
        src: 'https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9hNmY2N2RiMWMyY2E3Mzc2OGI0MDY2NTVlMTdkMTFiZj9zaXplPTUwJmRlZmF1bHQ9cmV0cm8ifQ._kzxMzRQ34s0tzLOCZF6lrF3Mgd_5QliQdc4ocaR2ow',
        position: CompositeImage.LOWER_LEFT,
        width: 30,
        height: 30,
      });
    const canvas = ref(img.getCanvas());
    const src = ref('');
    img.print().then((res) => {
      console.log(res);
      src.value = res;
    });

    setTimeout(() => {
      img.print().then((res) => {
        console.log(res);
        src.value = res;
      });
    }, 2000);
    onMounted(() => {
      canvas.value = img.getCanvas();
    });
    return () => (
      <div>
        <img src={src.value} style="border: 1px solid black" />
        <button onClick={() => img.download()}>download</button>
      </div>
    );
  },
});
</script>
