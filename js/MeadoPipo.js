import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

class MeadoPipo {
	static DEFAULTS = 
		taskURL               : 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
		modelURL              : 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
		delegate              : 'GPU'
		outputFaceBlendshapes : false,
		runningMode           : 'VIDEO',
		numFaces              : 1
	};

	constructor(
		taskURL               = MeadoPipo.DEFAULTS.taskURL,
		modelURL              = MeadoPipo.DEFAULTS.taskURL,
		delegate              = MeadoPipo.DEFAULTS.delegate,
		outputFaceBlendshapes = MeadoPipo.DEFAULTS.outputFaceBlendshapes,
		runningMode           = MeadoPipo.DEFAULTS.runningMode,
		numFaces              = MeadoPipo.DEFAULTS.numFaces,
	) {
		this.taskURL      = taskURL;
		this.modelURL     = modelURL;
		this.delegate     = delegate;
		this.runningMode  = runningMode;
		this.numFaces     = numFaces;
		this.outputFaceBlendshapes = outputFaceBlendshapes;
	}

	async init() {
		const filesetResolver = await FilesetResolver.forVisionTasks( taskURL );
		const modelURL = this.modelURL;
		this.faceLandmarker = await FaceLandmarker.createFromOptions(
			filesetResolver, 
			this
		);
	};

const canvas = document.getElementsByTagName( 'canvas' )[0];
const video  = document.getElementsByTagName( 'video' )[0];
const pre  = document.getElementsByTagName( 'pre' )[0];
const list = document.getElementsByTagName( 'ul' )[0];
video.style.display = 'none';

const numeric_debugger = !true; // to show the numeric vertex ids

const context = canvas.getContext( '2d' );
const drawingUtils = new DrawingUtils( context );
const values = new Map();
const strokeable = false;

let lastVideoTime = -1;
let results = undefined;
let safePlease = false;

let raging = false;
let lastLandmarks = null;

////////////////////////////////////////////////////////////////////////////////////////
const normalize = (pt) => {
	const length = Math.hypot(pt.x, pt.y, pt.z);
	return Object.fromEntries(
			Object.entries(pt).map(([k, v]) => [k, v / length])
			);
}
let SCREEN_NORMAL = normalize({ x: -.2, y: -.8, z: -1 });

////////////////////////////////////////////////////////////////////////////////////////
const COLOR_FACE_K  = [111, 141, 232].map(c=>c*1.4);
const COLOR_FACE_N  = [252, 77, 88];
const COLOR_BROW    = [141,88,111].map(c=>c * 1.1);
const COLOR_SCELERA = [255,255,255];
const COLOR_IRIS_K  = [111,0,255];
const COLOR_IRIS_N  = [255,0,88];
const COLOR_PUPIL   = [0,0,0];
const COLOR_MOUTH   = [171, 18, 33];
const COLOR_TEETH   = [255, 255, 255];
let COLOR_FACE = COLOR_FACE_K;
let COLOR_IRIS = COLOR_IRIS_K;
////////////////////////////////////////////////////////////////////////////////////////

const SIDES = 'Left Right'.split( ' ' );
const FACEMESH_TRIANGLES = [ [0, 11, 37], [0, 11, 267], [0, 37, 164], [0, 164, 267], [1, 4, 44], [1, 4, 274], [1, 19, 44], [1, 19, 274], [2, 94, 141], [2, 94, 370], [2, 97, 141], [2, 97, 167], [2, 164, 167], [2, 164, 393], [2, 326, 370], [2, 326, 393], [3, 51, 195], [3, 51, 236], [3, 195, 197], [3, 196, 197], [3, 196, 236], [4, 5, 51], [4, 5, 281], [4, 44, 45], [4, 45, 51], [4, 274, 275], [4, 275, 281], [5, 51, 195], [5, 195, 281], [6, 122, 168], [6, 122, 196], [6, 168, 351], [6, 196, 197], [6, 197, 419], [6, 351, 419], [7, 25, 33], [7, 25, 110], [7, 110, 163], [8, 9, 55], [8, 9, 285], [8, 55, 193], [8, 168, 193], [8, 168, 417], [8, 285, 417], [9, 55, 107], [9, 107, 108], [9, 108, 151], [9, 151, 337], [9, 285, 336], [9, 336, 337], [10, 109, 151], [10, 151, 338], [11, 12, 72], [11, 12, 302], [11, 37, 72], [11, 267, 302], [12, 13, 38], [12, 13, 268], [12, 38, 72], [12, 268, 302], [13, 38, 82], [13, 268, 312], [14, 15, 86], [14, 15, 316], [14, 86, 87], [14, 316, 317], [15, 16, 85], [15, 16, 315], [15, 85, 86], [15, 315, 316], [16, 17, 85], [16, 17, 315], [17, 18, 83], [17, 18, 313], [17, 83, 84], [17, 84, 85], [17, 313, 314], [17, 314, 315], [18, 83, 201], [18, 200, 201], [18, 200, 421], [18, 313, 421], [19, 44, 125], [19, 94, 141], [19, 94, 370], [19, 125, 141], [19, 274, 354], [19, 354, 370], [20, 60, 99], [20, 60, 166], [20, 79, 166], [20, 79, 238], [20, 99, 242], [20, 238, 242], [21, 54, 68], [21, 68, 71], [21, 71, 162], [22, 23, 145], [22, 23, 230], [22, 26, 154], [22, 26, 231], [22, 145, 153], [22, 153, 154], [22, 230, 231], [23, 24, 144], [23, 24, 229], [23, 144, 145], [23, 229, 230], [24, 110, 144], [24, 110, 228], [24, 228, 229], [25, 31, 226], [25, 31, 228], [25, 33, 130], [25, 110, 228], [25, 130, 226], [26, 112, 155], [26, 112, 232], [26, 154, 155], [26, 231, 232], [27, 28, 159], [27, 28, 222], [27, 29, 160], [27, 29, 223], [27, 159, 160], [27, 222, 223], [28, 56, 157], [28, 56, 221], [28, 157, 158], [28, 158, 159], [28, 221, 222], [29, 30, 160], [29, 30, 224], [29, 223, 224], [30, 160, 161], [30, 161, 247], [30, 224, 225], [30, 225, 247], [31, 111, 117], [31, 111, 226], [31, 117, 228], [32, 140, 171], [32, 140, 211], [32, 171, 208], [32, 194, 201], [32, 194, 211], [32, 201, 208], [33, 130, 247], [33, 246, 247], [34, 127, 139], [34, 127, 234], [34, 139, 156], [34, 143, 156], [34, 143, 227], [34, 227, 234], [35, 111, 143], [35, 111, 226], [35, 113, 124], [35, 113, 226], [35, 124, 143], [36, 100, 101], [36, 100, 142], [36, 101, 205], [36, 142, 203], [36, 203, 206], [36, 205, 206], [37, 39, 72], [37, 39, 167], [37, 164, 167], [38, 41, 72], [38, 41, 81], [38, 81, 82], [39, 40, 73], [39, 40, 92], [39, 72, 73], [39, 92, 165], [39, 165, 167], [40, 73, 74], [40, 74, 185], [40, 92, 186], [40, 185, 186], [41, 42, 74], [41, 42, 81], [41, 72, 73], [41, 73, 74], [42, 74, 184], [42, 80, 81], [42, 80, 183], [42, 183, 184], [43, 57, 61], [43, 57, 202], [43, 61, 146], [43, 91, 106], [43, 91, 146], [43, 106, 204], [43, 202, 204], [44, 45, 220], [44, 125, 237], [44, 220, 237], [45, 51, 134], [45, 134, 220], [46, 53, 63], [46, 53, 225], [46, 63, 70], [46, 70, 156], [46, 113, 124], [46, 113, 225], [46, 124, 156], [47, 100, 121], [47, 100, 126], [47, 114, 128], [47, 114, 217], [47, 121, 128], [47, 126, 217], [48, 49, 64], [48, 49, 131], [48, 64, 235], [48, 115, 131], [48, 115, 219], [48, 219, 235], [49, 64, 102], [49, 64, 129], [49, 102, 129], [49, 129, 209], [49, 131, 209], [50, 101, 118], [50, 101, 205], [50, 117, 118], [50, 117, 123], [50, 123, 187], [50, 187, 205], [51, 134, 236], [52, 53, 63], [52, 53, 223], [52, 63, 105], [52, 65, 66], [52, 65, 222], [52, 66, 105], [52, 222, 223], [53, 223, 224], [53, 224, 225], [54, 68, 104], [54, 103, 104], [55, 65, 107], [55, 65, 221], [55, 189, 193], [55, 189, 221], [56, 157, 173], [56, 173, 190], [56, 190, 221], [57, 61, 185], [57, 185, 186], [57, 186, 212], [57, 202, 212], [58, 132, 177], [58, 172, 215], [58, 177, 215], [59, 75, 166], [59, 75, 235], [59, 166, 219], [59, 219, 235], [60, 75, 166], [60, 75, 240], [60, 99, 240], [61, 76, 146], [61, 76, 184], [61, 184, 185], [62, 76, 77], [62, 76, 183], [62, 77, 96], [62, 78, 96], [62, 78, 191], [62, 183, 191], [63, 68, 71], [63, 68, 104], [63, 70, 71], [63, 104, 105], [64, 98, 129], [64, 98, 240], [64, 102, 129], [64, 235, 240], [65, 66, 107], [65, 221, 222], [66, 69, 105], [66, 69, 107], [67, 69, 104], [67, 69, 108], [67, 103, 104], [67, 108, 109], [69, 104, 105], [69, 107, 108], [70, 71, 139], [70, 139, 156], [71, 139, 162], [74, 184, 185], [75, 235, 240], [76, 77, 146], [76, 183, 184], [77, 90, 91], [77, 90, 96], [77, 91, 146], [78, 95, 96], [79, 166, 218], [79, 218, 237], [79, 237, 239], [79, 238, 239], [80, 183, 191], [83, 84, 181], [83, 181, 182], [83, 182, 201], [84, 85, 180], [84, 180, 181], [85, 86, 179], [85, 179, 180], [86, 87, 178], [86, 178, 179], [88, 89, 96], [88, 89, 179], [88, 95, 96], [88, 178, 179], [89, 90, 96], [89, 90, 180], [89, 179, 180], [90, 91, 181], [90, 180, 181], [91, 106, 182], [91, 181, 182], [92, 165, 206], [92, 186, 216], [92, 206, 216], [93, 132, 137], [93, 137, 227], [93, 227, 234], [97, 98, 99], [97, 98, 165], [97, 99, 242], [97, 141, 242], [97, 165, 167], [98, 99, 240], [98, 129, 203], [98, 165, 203], [100, 101, 120], [100, 120, 121], [100, 126, 142], [101, 118, 119], [101, 119, 120], [106, 182, 194], [106, 194, 204], [108, 109, 151], [110, 144, 163], [111, 116, 123], [111, 116, 143], [111, 117, 123], [112, 133, 155], [112, 133, 243], [112, 232, 233], [112, 233, 244], [112, 243, 244], [113, 225, 247], [113, 226, 247], [114, 128, 188], [114, 174, 188], [114, 174, 217], [115, 131, 220], [115, 218, 219], [115, 218, 220], [116, 123, 137], [116, 137, 227], [116, 143, 227], [117, 118, 229], [117, 228, 229], [118, 119, 230], [118, 229, 230], [119, 120, 230], [120, 121, 232], [120, 230, 231], [120, 231, 232], [121, 128, 232], [122, 168, 193], [122, 188, 196], [122, 188, 245], [122, 193, 245], [123, 137, 177], [123, 147, 177], [123, 147, 187], [124, 143, 156], [125, 141, 241], [125, 237, 241], [126, 129, 142], [126, 129, 209], [126, 209, 217], [127, 139, 162], [128, 188, 245], [128, 232, 233], [128, 233, 245], [129, 142, 203], [130, 226, 247], [131, 134, 198], [131, 134, 220], [131, 198, 209], [132, 137, 177], [133, 173, 190], [133, 190, 243], [134, 198, 236], [135, 136, 138], [135, 136, 150], [135, 138, 192], [135, 150, 169], [135, 169, 214], [135, 192, 214], [136, 138, 172], [138, 172, 215], [138, 192, 213], [138, 213, 215], [140, 148, 171], [140, 148, 176], [140, 170, 176], [140, 170, 211], [141, 241, 242], [147, 177, 215], [147, 187, 213], [147, 213, 215], [148, 152, 175], [148, 171, 175], [149, 150, 170], [149, 170, 176], [150, 169, 170], [151, 337, 338], [152, 175, 377], [161, 246, 247], [164, 267, 393], [165, 203, 206], [166, 218, 219], [168, 351, 417], [169, 170, 211], [169, 210, 211], [169, 210, 214], [171, 175, 199], [171, 199, 208], [174, 188, 196], [174, 196, 236], [174, 217, 236], [175, 199, 396], [175, 377, 396], [182, 194, 201], [186, 212, 216], [187, 192, 213], [187, 192, 214], [187, 205, 207], [187, 207, 214], [189, 190, 221], [189, 190, 243], [189, 193, 244], [189, 243, 244], [193, 244, 245], [194, 204, 211], [195, 197, 248], [195, 248, 281], [197, 248, 419], [198, 209, 217], [198, 217, 236], [199, 200, 208], [199, 200, 428], [199, 396, 428], [200, 201, 208], [200, 421, 428], [202, 204, 210], [202, 210, 214], [202, 212, 214], [204, 210, 211], [205, 206, 216], [205, 207, 216], [207, 212, 214], [207, 212, 216], [218, 220, 237], [233, 244, 245], [237, 239, 241], [238, 239, 241], [238, 241, 242], [248, 281, 456], [248, 419, 456], [249, 255, 263], [249, 255, 339], [249, 339, 390], [250, 290, 328], [250, 290, 392], [250, 309, 392], [250, 309, 459], [250, 328, 462], [250, 458, 459], [250, 458, 462], [251, 284, 298], [251, 298, 301], [251, 301, 389], [252, 253, 374], [252, 253, 450], [252, 256, 381], [252, 256, 451], [252, 374, 380], [252, 380, 381], [252, 450, 451], [253, 254, 373], [253, 254, 449], [253, 373, 374], [253, 449, 450], [254, 339, 373], [254, 339, 448], [254, 448, 449], [255, 261, 446], [255, 261, 448], [255, 263, 359], [255, 339, 448], [255, 359, 446], [256, 341, 382], [256, 341, 452], [256, 381, 382], [256, 451, 452], [257, 258, 386], [257, 258, 442], [257, 259, 387], [257, 259, 443], [257, 386, 387], [257, 442, 443], [258, 286, 384], [258, 286, 441], [258, 384, 385], [258, 385, 386], [258, 441, 442], [259, 260, 387], [259, 260, 444], [259, 443, 444], [260, 387, 388], [260, 388, 466], [260, 444, 445], [260, 445, 467], [260, 466, 467], [261, 340, 346], [261, 340, 446], [261, 346, 448], [262, 369, 396], [262, 369, 431], [262, 396, 428], [262, 418, 421], [262, 418, 431], [262, 421, 428], [263, 359, 467], [263, 466, 467], [264, 356, 368], [264, 356, 454], [264, 368, 383], [264, 372, 383], [264, 372, 447], [264, 447, 454], [265, 340, 372], [265, 340, 446], [265, 342, 353], [265, 342, 446], [265, 353, 372], [266, 329, 330], [266, 329, 371], [266, 330, 425], [266, 371, 423], [266, 423, 426], [266, 425, 426], [267, 269, 302], [267, 269, 393], [268, 271, 302], [268, 271, 311], [268, 311, 312], [269, 270, 303], [269, 270, 322], [269, 302, 303], [269, 322, 391], [269, 391, 393], [270, 303, 304], [270, 304, 409], [270, 322, 410], [270, 409, 410], [271, 272, 304], [271, 272, 311], [271, 302, 303], [271, 303, 304], [272, 304, 408], [272, 310, 311], [272, 310, 407], [272, 407, 408], [273, 287, 291], [273, 287, 422], [273, 291, 375], [273, 321, 335], [273, 321, 375], [273, 335, 424], [273, 422, 424], [274, 275, 440], [274, 354, 457], [274, 440, 457], [275, 281, 363], [275, 363, 440], [276, 283, 293], [276, 283, 445], [276, 293, 300], [276, 300, 383], [276, 342, 353], [276, 342, 445], [276, 353, 383], [277, 329, 350], [277, 329, 355], [277, 343, 357], [277, 343, 437], [277, 350, 357], [277, 355, 437], [278, 279, 294], [278, 279, 360], [278, 294, 455], [278, 344, 360], [278, 344, 439], [278, 439, 455], [279, 294, 331], [279, 294, 358], [279, 331, 358], [279, 358, 429], [279, 360, 429], [280, 330, 347], [280, 330, 425], [280, 346, 347], [280, 346, 352], [280, 352, 411], [280, 411, 425], [281, 363, 456], [282, 283, 293], [282, 283, 443], [282, 293, 334], [282, 295, 296], [282, 295, 442], [282, 296, 334], [282, 442, 443], [283, 443, 444], [283, 444, 445], [284, 298, 333], [284, 332, 333], [285, 295, 336], [285, 295, 441], [285, 413, 417], [285, 413, 441], [286, 384, 398], [286, 398, 414], [286, 414, 441], [287, 291, 409], [287, 409, 410], [287, 410, 432], [287, 422, 432], [288, 361, 401], [288, 397, 435], [288, 401, 435], [289, 290, 305], [289, 290, 392], [289, 305, 455], [289, 392, 439], [289, 439, 455], [290, 305, 460], [290, 328, 460], [291, 306, 375], [291, 306, 408], [291, 408, 409], [292, 306, 307], [292, 306, 407], [292, 307, 325], [292, 308, 325], [292, 308, 415], [292, 407, 415], [293, 298, 301], [293, 298, 333], [293, 300, 301], [293, 333, 334], [294, 327, 358], [294, 327, 460], [294, 331, 358], [294, 455, 460], [295, 296, 336], [295, 441, 442], [296, 299, 334], [296, 299, 336], [297, 299, 333], [297, 299, 337], [297, 332, 333], [297, 337, 338], [299, 333, 334], [299, 336, 337], [300, 301, 368], [300, 368, 383], [301, 368, 389], [304, 408, 409], [305, 455, 460], [306, 307, 375], [306, 407, 408], [307, 320, 321], [307, 320, 325], [307, 321, 375], [308, 324, 325], [309, 392, 438], [309, 438, 457], [309, 457, 459], [310, 407, 415], [313, 314, 405], [313, 405, 406], [313, 406, 421], [314, 315, 404], [314, 404, 405], [315, 316, 403], [315, 403, 404], [316, 317, 402], [316, 402, 403], [318, 319, 325], [318, 319, 403], [318, 324, 325], [318, 402, 403], [319, 320, 325], [319, 320, 404], [319, 403, 404], [320, 321, 405], [320, 404, 405], [321, 335, 406], [321, 405, 406], [322, 391, 426], [322, 410, 436], [322, 426, 436], [323, 361, 366], [323, 366, 447], [323, 447, 454], [326, 327, 328], [326, 327, 391], [326, 328, 462], [326, 370, 462], [326, 391, 393], [327, 328, 460], [327, 358, 423], [327, 391, 423], [329, 330, 349], [329, 349, 350], [329, 355, 371], [330, 347, 348], [330, 348, 349], [335, 406, 418], [335, 418, 424], [339, 373, 390], [340, 345, 352], [340, 345, 372], [340, 346, 352], [341, 362, 382], [341, 362, 463], [341, 452, 453], [341, 453, 464], [341, 463, 464], [342, 445, 467], [342, 446, 467], [343, 357, 412], [343, 399, 412], [343, 399, 437], [344, 360, 440], [344, 438, 439], [344, 438, 440], [345, 352, 366], [345, 366, 447], [345, 372, 447], [346, 347, 449], [346, 448, 449], [347, 348, 450], [347, 449, 450], [348, 349, 450], [349, 350, 452], [349, 450, 451], [349, 451, 452], [350, 357, 452], [351, 412, 419], [351, 412, 465], [351, 417, 465], [352, 366, 401], [352, 376, 401], [352, 376, 411], [353, 372, 383], [354, 370, 461], [354, 457, 461], [355, 358, 371], [355, 358, 429], [355, 429, 437], [356, 368, 389], [357, 412, 465], [357, 452, 453], [357, 453, 465], [358, 371, 423], [359, 446, 467], [360, 363, 420], [360, 363, 440], [360, 420, 429], [361, 366, 401], [362, 398, 414], [362, 414, 463], [363, 420, 456], [364, 365, 367], [364, 365, 379], [364, 367, 416], [364, 379, 394], [364, 394, 434], [364, 416, 434], [365, 367, 397], [367, 397, 435], [367, 416, 433], [367, 433, 435], [369, 377, 396], [369, 377, 400], [369, 395, 400], [369, 395, 431], [370, 461, 462], [376, 401, 435], [376, 411, 433], [376, 433, 435], [378, 379, 395], [378, 395, 400], [379, 394, 395], [391, 423, 426], [392, 438, 439], [394, 395, 431], [394, 430, 431], [394, 430, 434], [399, 412, 419], [399, 419, 456], [399, 437, 456], [406, 418, 421], [410, 432, 436], [411, 416, 433], [411, 416, 434], [411, 425, 427], [411, 427, 434], [413, 414, 441], [413, 414, 463], [413, 417, 464], [413, 463, 464], [417, 464, 465], [418, 424, 431], [420, 429, 437], [420, 437, 456], [422, 424, 430], [422, 430, 434], [422, 432, 434], [424, 430, 431], [425, 426, 436], [425, 427, 436], [427, 432, 434], [427, 432, 436], [438, 440, 457], [453, 464, 465], [457, 459, 461], [458, 459, 461], [458, 461, 462], ];
const FACEMESH_QUADS = [[299,333,332,297],[0,11,302,267],[233,232,121,128],[269,303,304,270],[245,128,114,188],[111,117,228,31],[103,54,68,104],[227,34,127,234],[119,101,100,120],[73,72,37,39],[70,46,53,63],[134,131,115,220],[334,293,298,333],[72,11,0,37],[41,42,80,81],[165,92,40,39],[121,232,231,120],[214,212,216,207],[182,83,84,181],[375,307,320,321],[29,160,159,27],[56,28,158,157],[83,201,200,18],[116,143,34,227],[203,206,92,165],[138,215,58,172],[275,281,5,4],[24,144,163,110],[291,306,307,375],[142,126,47,100],[418,421,428,262],[146,43,106,91],[16,85,84,17],[77,76,61,146],[126,209,198,217],[396,377,400,369],[165,39,37,167],[244,233,128,245],[30,247,246,161],[33,246,247,130],[174,217,198,236],[417,351,412,465],[124,113,225,46],[224,223,52,53],[98,64,102,129],[192,214,207,187],[218,79,239,237],[133,155,112,243],[344,360,363,440],[140,170,149,176],[399,412,351,419],[118,229,228,117],[281,275,440,363],[70,63,68,71],[314,313,406,405],[221,189,193,55],[113,247,30,225],[105,52,65,66],[235,59,166,219],[107,55,8,9],[66,65,55,107],[68,63,105,104],[119,118,50,101],[241,125,44,237],[5,195,3,51],[142,129,209,126],[33,130,25,7],[322,270,409,410],[32,194,204,211],[36,101,50,205],[194,201,83,182],[237,239,238,241],[25,110,163,7],[224,53,46,225],[153,145,23,22],[210,202,212,214],[245,193,189,244],[424,335,406,418],[317,316,403,402],[32,211,170,140],[11,72,38,12],[207,216,206,205],[237,220,115,218],[45,220,237,44],[183,42,74,184],[208,201,194,32],[268,271,303,302],[213,147,177,215],[234,93,137,227],[66,107,108,69],[6,351,417,168],[192,187,147,213],[96,62,76,77],[124,46,70,156],[316,15,16,315],[114,128,121,47],[147,123,137,177],[251,284,332,333,298,301],[180,85,86,179],[289,392,290,305],[179,86,87,178],[105,63,53,52],[118,117,123,50],[145,144,24,23],[324,318,319,325],[122,188,174,196],[292,308,324,325],[149,170,169,150],[177,137,93,132],[327,294,455,460],[360,420,456,363],[335,273,375,321],[395,394,430,431],[12,38,82,13],[277,329,349,350],[190,56,157,173],[116,111,35,143],[223,222,65,52],[139,71,21,162],[162,127,34,139],[365,364,394,379],[218,115,48,219],[429,358,371,355],[156,143,35,124],[376,352,280,411],[124,35,226,113],[354,19,94,370],[119,230,229,118],[248,456,399,419],[161,160,29,30],[45,44,1,4],[140,171,208,32],[393,391,327,326],[31,25,130,226],[299,297,338,337],[394,395,378,379],[101,36,142,100],[216,212,57,186],[326,2,164,393],[241,238,20,242],[185,40,92,186],[268,302,11,12],[191,80,42,183],[139,34,143,156],[222,221,55,65],[188,114,217,174],[322,426,423,391],[36,203,129,142],[279,429,420,360],[1,274,275,4],[133,243,190,173],[240,75,59,235],[107,9,151,108],[26,154,153,22],[210,214,135,169],[354,274,1,19],[89,88,95,96],[320,319,403,404],[315,314,405,404],[106,43,202,204],[200,421,313,18],[152,175,171,148],[375,273,287,291],[291,287,410,409],[129,203,165,98],[114,47,126,217],[326,327,460,328],[104,105,66,69],[235,64,98,240],[199,200,201,208],[331,294,327,358],[99,60,75,240],[242,141,125,241],[328,462,370,326],[219,166,79,218],[232,26,22,231],[189,221,56,190],[222,28,56,221],[243,112,233,244],[31,228,110,25],[225,30,29,224],[231,22,23,230],[224,29,27,223],[113,226,130,247],[31,226,35,111],[233,112,26,232],[229,24,110,228],[223,27,28,222],[94,19,125,141],[238,239,79,20],[242,20,60,99],[156,70,71,139],[75,60,166,59],[188,122,193,245],[230,23,24,229],[231,230,119,120],[120,100,47,121],[207,205,50,187],[331,279,278,294],[195,248,419,197],[198,209,49,131],[176,148,171,140],[116,123,117,111],[27,159,158,28],[244,189,190,243],[378,395,369,400],[267,302,303,269],[350,452,453,357],[74,73,39,40],[168,417,285,8],[282,443,444,283],[396,175,152,377],[109,67,69,108],[300,276,353,383],[185,61,76,184],[298,293,300,301],[49,48,115,131],[421,200,199,428],[303,271,272,304],[270,322,391,269],[295,442,443,282],[426,436,427,425],[335,321,405,406],[18,313,314,17],[386,387,259,257],[254,373,374,253],[313,421,418,406],[296,334,333,299],[312,311,271,268],[54,21,71,68],[220,45,51,134],[390,373,254,339],[314,315,16,17],[371,266,330,329],[422,273,335,424],[57,43,146,61],[90,77,146,91],[181,84,85,180],[422,424,431,430],[356,264,447,454],[267,269,391,393],[357,453,464,465],[263,359,467,466],[263,249,255,359],[420,429,355,437],[193,122,6,168],[448,449,347,346],[276,283,444,445],[240,98,97,99],[280,330,266,425],[306,291,409,408],[259,387,388,260],[363,456,248,281],[337,338,10,151],[437,343,412,399],[348,450,451,349],[344,278,279,360],[401,376,433,435],[366,323,454,447],[181,91,106,182],[417,413,441,285],[359,255,261,446],[283,276,300,293],[290,250,462,328],[343,357,465,412],[178,88,89,179],[265,340,345,372],[428,396,369,262],[295,282,334,296],[274,354,461,457],[3,236,134,51],[358,423,266,371],[385,386,257,258],[393,164,0,267],[206,216,186,92],[277,355,371,329],[43,57,212,202],[458,459,457,461],[380,381,256,252],[265,446,261,340],[398,384,286,414],[436,432,434,427],[446,265,353,342],[182,106,204,194],[42,41,73,74],[301,300,383,368],[424,418,262,431],[294,278,439,455],[48,49,102,64],[73,41,38,72],[432,422,430,434],[310,272,271,311],[352,366,447,345],[251,301,368,389],[208,171,175,199],[55,193,168,8],[376,411,416,433],[89,96,77,90],[329,330,348,349],[179,89,90,180],[280,347,348,330],[264,372,345,447],[323,366,401,361],[307,325,319,320],[15,14,87,86],[265,372,383,353],[352,346,347,280],[362,398,414,463],[317,14,15,316],[355,277,343,437],[95,78,62,96],[10,109,108,151],[397,367,364,365],[1,44,125,19],[312,268,12,13],[236,198,131,134],[186,57,61,185],[151,9,336,337],[41,81,82,38],[413,417,465,464],[466,467,260,388],[8,285,336,9],[445,342,353,276],[264,356,389,368],[435,433,416,367],[169,135,136,150],[457,440,275,274],[211,204,202,210],[346,352,345,340],[283,293,334,282],[451,452,350,349],[94,2,326,370],[449,450,348,347],[196,3,195,197],[253,374,380,252],[344,440,457,438],[366,352,376,401],[448,346,340,261],[359,446,342,467],[135,138,172,136],[288,435,367,397],[280,425,427,411],[287,432,436,410],[98,165,167,97],[141,242,99,97],[174,236,3,196],[184,74,40,185],[306,292,325,307],[395,431,262,369],[285,441,442,295],[427,434,416,411],[410,436,426,322],[420,437,399,456],[164,2,97,167],[278,344,438,439],[390,339,255,249],[305,290,328,460],[372,264,368,383],[385,258,286,384],[434,364,367,416],[250,458,461,462],[319,318,402,403],[16,15,86,85],[321,320,404,405],[84,83,18,17],[432,287,273,422],[361,401,435,288],[184,76,62,183],[292,306,408,407],[391,423,358,327],[351,6,197,419],[227,137,123,116],[392,289,455,439],[175,396,428,199],[219,48,64,235],[423,426,425,266],[331,358,429,279],[364,434,430,394],[309,250,290,392],[354,370,462,461],[97,2,94,141],[254,253,450,449],[414,413,464,463],[253,252,451,450],[260,467,342,445],[259,260,445,444],[257,259,444,443],[453,341,463,464],[197,6,122,196],[258,257,443,442],[286,441,413,414],[339,448,261,255],[339,254,449,448],[256,341,453,452],[60,20,79,166],[309,392,439,438],[337,336,296,299],[309,459,458,250],[50,123,147,187],[252,256,452,451],[214,192,138,135],[350,357,343,277],[112,155,154,26],[5,51,45,4],[205,206,203,36],[248,195,5,281],[215,177,132,58],[285,295,296,336],[381,382,341,256],[286,258,442,441],[210,169,170,211],[305,460,455,289],[103,104,69,67],[270,304,408,409],[459,309,438,457],[213,215,138,192],[316,315,404,403],[180,90,91,181],[0,164,167,37],[362,463,341,382],[209,129,102,49],[304,272,407,408],[310,415,407,272],[308,292,407,415],[183,62,78,191]]
const FACEMESH = FACEMESH_QUADS;

const FACE_MESH_LIP_TOP    = 13;
const FACE_MESH_LIP_BOTTOM = 14;
const FACE_MESH_LIP_LEFT   = 78;
const FACE_MESH_LIP_RIGHT  = 308;

const FACE_MESH_FACE_TOP    = 10
const FACE_MESH_FACE_BOTTOM = 152;
const FACE_MESH_FACE_LEFT   = 93;
const FACE_MESH_FACE_RIGHT  = 323;

////////////////////////////////////////////////////////////////////////////////////////

const joiner= (edges) => {
	const pairs = new Map();
	edges.forEach(a=> {
			const k = [a[0], a[a.length-1]].join('->');
			if (pairs.has(k)) pairs.get(k).push(a);
			else pairs.set(k, [a])
			});

	const joined = [];
	for (const pair of pairs.values()) {
		const a = pair[0];
		if (1 == pair.length) {
			joined.push(a);
			continue;
		}
		if (2 != pair.length) {
			throw new Error(`I was wrong:` + pair.length + ' for ' + JSON.stringify(pair));
		}
		const b = pair[1].reverse().slice(1).slice(0,-1);
		joined.push([...a,...b]);
	}
	return joined;
}

const unroller = (edges) => {
	let current = null, last = null;
	const unrolled = [];

	for (const edge of edges) {
		if (last === edge.start) {
			current.push(edge.start);
		} else {
			if (current) current.push(last);
			unrolled.push(current = [edge.start]);
		}
		last = edge.end;
	}
	if (current && last !== null) current.push(last); // ✅ close final chain
	return unrolled;
}

const flamberger = (eggos) => joiner(unroller(eggos));

const UR_LEFT_EYEBROW  = flamberger(FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW);
const UR_LEFT_EYE      = flamberger(FaceLandmarker.FACE_LANDMARKS_LEFT_EYE);
const UR_LEFT_IRIS     = flamberger(FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS);
const UR_FACE_OVAL     = flamberger(FaceLandmarker.FACE_LANDMARKS_FACE_OVAL);
const UR_LIPS          = flamberger(FaceLandmarker.FACE_LANDMARKS_LIPS);
const UR_RIGHT_EYEBROW = flamberger(FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW);
const UR_RIGHT_EYE     = flamberger(FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE);
const UR_RIGHT_IRIS    = flamberger(FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS);
////////////////////////////////////////////////////////////////////////////////////////

const pickIt = (choices,key) => {
	const s = values.get( key ).scaled;
	const i = Math.floor( choices.length * s );
	const j = isNaN( i ) ? 0 : i;
	const c = choices[ j < 0 ? 0 : j > choices-1 ? choices-1 : j ];
	return c ? c : '-';
};

const gimme = ( base, ...options ) => {
	const r = SIDES.map(
			(k,i) => pickIt( options[ i%options.length], `${base}${k}` )
			);
	if ( r.length != 2 ) console.log( base, r );
	return r;
};

const newValue = () => {return {values:[],current:0,scaled:0,min:Infinity,max:-Infinity};};

const download = ( filename, data, type = 'application/json;charset=utf-8', expiration = 3 * 1000 ) => {
	data = [data];

	const blob = new Blob( data, {type} );
	const url = window.URL.createObjectURL( blob );

	const a = document.createElement( 'a' );
	a.style.display = 'none';
	a.href = url;
	a.download = filename;
	document.body.appendChild( a );

	a.click();
	setTimeout(() => { document.body.removeChild( a ); window.URL.revokeObjectURL( url ); }, expiration );
};

const dd = (landmarks, landmark, c) =>  drawingUtils.drawConnectors( landmarks, landmark, c );
const predictWebcam = () => {
	let nowInMs = Date.now();
	if (lastVideoTime !== video.currentTime) {
		lastVideoTime = video.currentTime;
		results = faceLandmarker.detectForVideo( video, nowInMs );
	}

	if (numeric_debugger) { 
		canvas.width  = 3 * video.videoWidth;
		canvas.height = 3 * video.videoHeight;
	} else {
		if ( canvas.width != video.videoWidth )   canvas.width  = video.videoWidth;
		if ( canvas.height != video.videoHeight ) canvas.height = video.videoHeight;
	}

	if (results.faceLandmarks && results.faceLandmarks.length) {
		//context.clearRect(0, 0, canvas.width, canvas.height);
		if (raging) { 
			context.fillStyle = 'rgba(0,255,0,.33)';
		} else {
			context.fillStyle = 'rgba(0,255,0,.44)';
		}
		context.fillRect(0, 0, canvas.width, canvas.height);
		prettyPolygons(results);
	}
	window.requestAnimationFrame(predictWebcam);
}

const toRBG = (c) => {
	return 'rgb(' + c.join(',') + ')';
			}

			const prettyPolygons = (results) => {
			context.strokeStyle = toRBG(COLOR_FACE.map(c=>c*.6));
			context.lineWidth = 2;

			SCREEN_NORMAL = normalize(raging 
					? { x: -.2, y: +1.1, z: -1 }
					: { x: -.0, y: -.1, z: -1 }
					);

			const landmarks = toScreen(results);

			faceTheMuzak(landmarks);

			[UR_LEFT_EYE, UR_RIGHT_EYE].forEach(poly => prettyPoly(poly, landmarks, COLOR_SCELERA, false));
			[UR_LEFT_IRIS, UR_RIGHT_IRIS].forEach(poly => {
					const centroid = computeCentroid(poly, landmarks);
					const ptz = poly[0].map(i=>landmarks[i]);
					const r = Math.abs(ptz[0].x - ptz[2].x) * canvas.width * .77;

					if (raging) { 
					prettyPoly(poly, landmarks, COLOR_IRIS, false);
					} else {
					//context.fillStyle = toRBG(COLOR_IRIS);
					//fillCircle(centroid.sx, centroid.sy, r);
					fancyEye(centroid,r);
					}

					context.fillStyle = toRBG(COLOR_PUPIL);
					fillCircle(centroid.sx, centroid.sy, r*.33);
					});

			drawMouth(context, landmarks, COLOR_MOUTH, COLOR_TEETH);
			painter(FACEMESH, landmarks, COLOR_FACE);

			[UR_LEFT_EYEBROW[0], UR_RIGHT_EYEBROW[0]].forEach(poly => prettyPoly(poly, landmarks, COLOR_BROW));

			if (numeric_debugger) {
				context.font = '24px fixed';
				context.fillStyle = 'white';
				landmarks.forEach((p,i) => context.fillText(i, p.sx, p.sy));
			}	
			};

const fancyEye = (centroid, r) =>{
	// Create a radial gradient for the iris
	const irisGradient = context.createRadialGradient(
			centroid.sx, centroid.sy, r * 0.1,  // inner circle
			centroid.sx, centroid.sy, r         // outer circle
			);
	const irisInner = `hsl(200, 70%, 55%)`; // calm blue center
	const irisOuter = `hsl(220, 70%, 15%)`; // calm dark rim

	irisGradient.addColorStop(0, irisInner);
	irisGradient.addColorStop(0.7, irisInner);
	irisGradient.addColorStop(1, irisOuter);

	context.fillStyle = irisGradient;
	fillCircle(centroid.sx, centroid.sy, r);
	context.fillStyle = 'white';
	const f = .3;
	fillCircle(centroid.sx+r*f, centroid.sy-r*f, r*.2);



}

const fillCircle = (x,y,r) => {
	context.beginPath(); 
	context.arc(x, y, r, 0, Math.PI * 2); 
	context.fill();
};

const faceTheMuzak = (landmarks) => {
	return 'i cannot figure out a nice way to do this';
	const nasal = landmarks[4];
	const forehead = landmarks[8];
	const right = landmarks[280];
	const left = landmarks[50];

	const x = nasal.sx - forehead.sx;
	const y = nasal.sy - forehead.sy;

	const r = Math.max(Math.abs(x), Math.abs(y)) * 2;
	const rnd = {
sx: nasal.sx - x * 4.8,
	sy: nasal.sy - y * 0.8
	};

	context.fillStyle = toRBG(COLOR_FACE);
	fillCircle(rnd.sx, rnd.sy, r);

	return;

	const fn = faceNormal(landmarks);

	const fasal = {
sx:nasal.sx -  133 * fn.x,
   sy:nasal.sy -  133 * fn.y
	}

	context.strokeStyle = 'black';
	context.lineWidth = 4;
	context.beginPath();
	context.moveTo(nasal.sx, nasal.sy);
	context.lineTo(fasal.sx, fasal.sy);
	context.closePath();
	context.stroke();

	const p = 100;
	fn.x = Math.floor(fn.x * p)/p;
	fn.y = Math.floor(fn.y * p)/p;
	fn.z = Math.floor(fn.z * p)/p; 
	pre.innerHTML = JSON.stringify(fn);
};

const toScreen = (results, f = 1.2, g = -.1) => {
	const landmarks = results.faceLandmarks[0];

	const lul = lastLandmarks;
	lastLandmarks = landmarks.slice(0);

	if (raging && lul){
		const damping = 0.3;

		landmarks.forEach((landmark,i) => {
				const last = lul[i];
				const f = 1.8;

				const dx  = (landmark.x - last.x);
				const dy  = (landmark.y - last.y);
				const dz  = (landmark.z - last.z);

				landmark.x = last.x + dx * f;
				landmark.y = last.y + dy * f;
				landmark.z = last.z + dz * f;
				});
	}

	landmarks.forEach(landmark => landmarkToScreen(landmark, f, g));

	FACEMESH.forEach(poly => {
			const ptz = poly.map(i=>landmarks[i]);
			const normal = polyNormal(ptz);
			ptz.forEach(pt => {
					pt.nc++;
					pt.nx += normal.x;
					pt.ny += normal.y;
					pt.nz += normal.z;
					});
			});
	landmarks.filter(l=>l.nc).forEach(landmark=>{
			landmark.nx /= landmark.nc;
			landmark.ny /= landmark.nc;
			landmark.nz /= landmark.nc;
			});


	return landmarks;
}

const landmarkToScreen = (landmark, f = 1.2, g = -.1) => {
	const x = 1.1; // lul
	landmark.sx = f * landmark.x * canvas.width  * x  + g * canvas.width ;
	landmark.sy = f * landmark.y * canvas.height  + g * canvas.height;
	landmark.sx = canvas.width - landmark.sx;
	if (numeric_debugger) landmark.sy -=200;
	landmark.nx = 0;
	landmark.ny = 0;
	landmark.nz = 0;
	landmark.nc = 0
		return landmark;
}

const prettyPoly = (poly, landmarks, color, stroke = true) => {
	if (Number.isInteger(poly[0])) {
		drawPoly(poly.map(i => landmarks[i]), color, stroke);
	} else {
		for (const p of poly) {
			drawPoly(p.map(i => landmarks[i]), color, stroke);
		}
	}
}

const painter = (indices, landmarks, color) => {
	indices
		.slice() // copy so we don't mutate original
		.sort((a, b) => {
				// Compute average z for each triangle
				//const az = landmarks[a[0]].z;
				//const bz = landmarks[b[0]].z;
				const az = (landmarks[a[0]].z + landmarks[a[1]].z + landmarks[a[2]].z) / 3;
				const bz = (landmarks[b[0]].z + landmarks[b[1]].z + landmarks[b[2]].z) / 3;
				return bz - az; // draw smallest z first (back)
				})
	.forEach(poly => prettyPoly(poly, landmarks, color));
}

const computeCentroid = (indices, landmarks) => {
	let sumX = 0;
	let sumY = 0;
	let sumZ = 0;

	if (Array.isArray(indices[0])) {
		indices = indices.flat();
	}

	const n = indices.length;

	indices.forEach(i => {
			sumX += landmarks[i].sx;
			sumY += landmarks[i].sy;
			sumZ += landmarks[i].z;
			});

	return { sx: sumX / n, sy: sumY / n, z: sumZ / n };
}

const drawMouth= (ctx, landmarks, mouthColor = COLOR_MOUTH, teethColor = COLOR_TEETH) => {
	// Outer mouth corners
	const top    = landmarks[FACE_MESH_LIP_TOP];
	const bottom = landmarks[FACE_MESH_LIP_BOTTOM];
	const left   = landmarks[FACE_MESH_LIP_LEFT];
	const right  = landmarks[FACE_MESH_LIP_RIGHT];

	// Compute rotation angle from left → right
	const angle = Math.atan2(right.sy - left.sy, right.sx - left.sx);

	// Compute center
	const cx = (left.sx + right.sx) / 2;
	const cy = (top.sy + bottom.sy) / 2;

	// Width and height
	const rx = Math.abs((right.sx - left.sx) / 2);   // horizontal radius
	const ry = Math.abs((bottom.sy - top.sy) / 2);   // vertical radius

	prettyPoly(UR_LIPS, landmarks, COLOR_MOUTH, false);



	// Draw upper teeth
	const f = 1.8; // fudge factor for vertical offset
	const teethWidth  = rx * 1.8;
	const teethHeight = ry * 0.4;

	ctx.fillStyle = toRBG(teethColor);
	ctx.beginPath();
	ctx.ellipse(cx, cy - ry * f * 0.5, teethWidth / 2, teethHeight / 2, angle, 0, Math.PI * 2);
	ctx.closePath()
		ctx.fill();

	// Draw lower teeth
	ctx.beginPath();
	ctx.ellipse(cx, cy + ry * f * 0.5, teethWidth / 2, teethHeight / 2, angle, 0, Math.PI * 2);
	ctx.closePath()
		ctx.fill();

	if (raging) return drawFangs(ctx, cx, cy, rx, ry, angle, raging, toRBG(teethColor));
};

// 🧛 CARTOON FANGS OF DOOM
const drawFangs = (ctx, cx, cy, rx, ry, angle, rage, color) => {
	const fangCount = 2; // left + right
	const fangBaseWidth  = rx * 0.12 * 2.2; // how wide the root of each fang is
	const fangBaseHeight = ry * 0.3 * .7;  // how tall at calm state
	const fangLength = fangBaseHeight * (2 + rage * 1.5); // lengthens with rage
	const fangSpread = rx * 0.65 * .6; // distance from center to each fang

	ctx.save();
	ctx.translate(cx, cy - ry * 1.1); // lift to upper lip area
	ctx.rotate(angle);

	for (let i = 0; i < fangCount; i++) {
		const side = i === 0 ? -1 : 1;
		const baseX = side * fangSpread;
		const baseY = 0;

		// exaggerated cartoon fang shape
		const tipX = baseX + side * fangBaseWidth * 0.2;
		const tipY = baseY + fangLength;

		ctx.beginPath();
		ctx.moveTo(baseX - fangBaseWidth * 0.5 * side, baseY);
		ctx.lineTo(baseX + fangBaseWidth * 0.5 * side, baseY);
		ctx.lineTo(tipX, tipY);
		ctx.closePath();

		// dynamic color & outline
		///const redTint = Math.floor(255 * rage);
		///ctx.fillStyle = rage > 0.6 ? `rgb(255,${200 - redTint / 2},${200 - redTint / 3})` : color;
		///ctx.strokeStyle = `rgba(${redTint},0,0,${0.5 + rage * 0.5})`;
		ctx.lineWidth = 2 + rage * 2;

		ctx.fill();
		///ctx.stroke();
	}

	ctx.restore();
};

const drawPoly = (ptz, color, stroke = true) => {
	//const normal = polyNormal(ptz);
	//const normal = avgNormal(ptz.map(p=>{ const o = {x:p.nx, y:p.ny, z:p.nz}; return o; }));
	const normal = safePlease 
		? polyNormal(ptz)
		: avgNormal(ptz.map(p=>{ const o = {x:p.nx, y:p.ny, z:p.nz}; return o; }));


	const dot = Math.abs(dotProduct(normal, SCREEN_NORMAL));
	context.fillStyle = toRBG(color.map(c => c * dot + 11));

	context.beginPath();
	ptz.forEach((pt,i)=> i ? context.lineTo(pt.sx, pt.sy) : context.moveTo(pt.sx, pt.sy));
	context.closePath();

	context.fill();
	if (stroke && strokeable) context.stroke();
};

const dotProduct = (a,b) => ( a.x * b.x + a.y * b.y + a.z * b.z);

const faceNormal = (landmarks) => {
	const normals = 
		[
		[ FACE_MESH_FACE_TOP, FACE_MESH_FACE_BOTTOM, FACE_MESH_FACE_LEFT ],
		[ FACE_MESH_LIP_TOP, FACE_MESH_LIP_BOTTOM, FACE_MESH_LIP_LEFT ],
		[ 8,4,50 ], // nose tip 4 ; nose bridge 8, cheek right 280, check left 50
		].map(a => polyNormal(a.map(i=>landmarks[i])));

		const merged = avgNormal(normals);
		return normalize(merged);

		return polyNormal([ 8,4,50 ].map(i=>landmarks[i]));
}

const avgNormal = (normals) => {
	const sum = normals.reduce(
			(acc, n) => {
			acc.x += n.x;
			acc.y += n.y;
			acc.z += n.z;
			return acc;
			},
			{ x: 0, y: 0, z: 0 }
			);

	const len = normals.length;
	return { x: sum.x / len, y: sum.y / len, z: sum.z / len };
};

const polyNormal = (ptz) => {
	const [v1, v2, v3] = ptz;

	// Compute edge vectors (v1→v2, v1→v3)
	const U = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
	const V = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };

	// Cross product U × V
	return normalize({
x: U.y * V.z - U.z * V.y,
y: U.z * V.x - U.x * V.z,
z: U.x * V.y - U.y * V.x
});
};

const move = 'mousemove';
const start = () => {
	canvas.removeEventListener( move, start );
	const constraints = { video: true };
	pre.innerHTML = '';

	navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
			video.srcObject = stream;
			video.addEventListener('loadeddata', predictWebcam);
			});
};

const landmarkDump = () => {
	console.log(JSON.stringify({
				'TESSELATION'   : FaceLandmarker.FACE_LANDMARKS_TESSELATION,
				'LEFT_EYEBROW'  : FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
				'LEFT_EYE'      : FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
				'LEFT_IRIS'     : FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
				'FACE_OVAL'     : FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
				'LIPS'          : FaceLandmarker.FACE_LANDMARKS_LIPS,
				'RIGHT_EYEBROW' : FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
				'RIGHT_EYE'     : FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
				'RIGHT_IRIS'    : FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
				}));
}

const indexDump = () => {
	console.log(JSON.stringify({
				'LEFT_EYEBROW'  :  UR_LEFT_EYEBROW  , 
				'LEFT_EYE'      :  UR_LEFT_EYE      , 
				'LEFT_IRIS'     :  UR_LEFT_IRIS     , 
				'FACE_OVAL'     :  UR_FACE_OVAL     , 
				'RIGHT_EYEBROW' :  UR_RIGHT_EYEBROW , 
				'RIGHT_EYE'     :  UR_RIGHT_EYE     , 
				'RIGHT_IRIS'    :  UR_RIGHT_IRIS    , 
				'LIPS'          :  UR_LIPS          , 
				}));
}

const demo = () => {
	context.fillStyle = '#0F0';
	context.font = '32px fixed';
	context.fillText( 'mouse over this canvas', 33, 33 );
	canvas.addEventListener( move, start );
	document.addEventListener('click', (e)=>{
			raging = !raging;
			COLOR_FACE = raging ? COLOR_FACE_N : COLOR_FACE_K;
			COLOR_IRIS = raging ? COLOR_IRIS_N : COLOR_IRIS_K;
			});

	if (!true) landmarkDump();
	if (true) indexDump();

	canvas.addEventListener( 'keydown', (event)=> {
			if ( 'enter' === event.key.toLowerCase() ) {
			safePlease = !safePlease;
			}
			});
};
}
