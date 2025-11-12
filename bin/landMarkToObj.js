#!/usr/bin/env node 

const fs = require( 'fs' );


class landMarkToObj {
	constructor() {
	}

	main( args ) {
		if ( 1 != args.length ) {
			throw new Error( 'usage: landMarkToObj <mediapipe.json>' );
		}
		const filename = args[ 0 ];
		const outputFilename = filename.replace( /.*\//, '' ).replace( /\.json$/, '.obj' );
		if ( outputFilename === filename ) {
			throw new Error( `input filename needs to end with .json, yo, not like ${filename}` );
		}

		return fs.readFile( filename, 'utf-8', (e,d)=>{
			if ( e ) throw e;
			this.onFile( outputFilename, JSON.parse( d ) );
		});
	}

	onFile( outputFilename, mediapipe ) {
		return this.ogonFile( outputFilename, mediapipe );
	}

	reonFile( outputFilename, mediapipe ) {
		const lines = [];

		for ( const point of mediapipe.landmarks ) {
			const line = 'v'.split( '' );
			for ( const [dimension,value] of Object.entries( point ) ) {
				line.push( value );
			}
			lines.push( line.join( ' ' ) );
		}

		if ( 0 != mediapipe.tesselation.length % 3 ) {
			throw new Error( `tesselation means mod 3, not ${mediapipe.tesselation.length}` );
		}

//		const shared = new Map();
const sharedEdges = new Map();

for ( let j = 0 ; j < mediapipe.tesselation.length ; ) {
	const i0 = mediapipe.tesselation[ j++ ];
	const i1 = mediapipe.tesselation[ j++ ];
	const i2 = mediapipe.tesselation[ j++ ];

	if ( i0.end != i1.start || i1.end != i2.start || i2.end != i0.start ) {
		throw new Error( `bad tesselation: ${i0}, ${i1} and ${i2}` );
	}

	const v0 = i0.start + 1;
	const v1 = i1.start + 1;
	const v2 = i2.start + 1;
	const triangle = [v0,v1,v2];


	for (let i = 0; i < 3; i++) {
		const v0 = triangle[i];
		const v1 = triangle[(i + 1) % 3];
		const edgeKey = [v0, v1].sort((a, b) => a - b).join(' ');

		if (!sharedEdges.has(edgeKey)) {
			sharedEdges.set(edgeKey, []);
		}

		sharedEdges.get(edgeKey).push(triangle);
	}
}
for (const [edgeKey, triangles] of sharedEdges.entries()) {
  const numTriangles = triangles.length;

  if (numTriangles === 1) {
    // Only one triangle, add to lines array
    const triangle = triangles[0];
    lines.push('f ' + triangle.sort((a, b) => a - b).join(' '));
  } else if (numTriangles === 2) {
/*
    // Two triangles, form a quad and add to lines array
    const quad = [...triangles[0], ...triangles[1].filter(v => !edgeKey.includes(v))].sort((a, b) => a - b);
    lines.push('f ' + quad.join(' '));
*/

	      // Two triangles, form a quad and add to lines array
    const vertices = edgeKey.split(' ').map(v => parseInt(v));
    const quad = [];
    for (const triangle of triangles) {
      const missingVertex = triangle.find(v => !vertices.includes(v));
      quad.push(...vertices, missingVertex);
    }
    lines.push('f ' + quad.join(' '));

  } else {
    // More than two triangles, handle as desired
    for (const triangle of triangles) {
      lines.push('f ' + triangle.sort((a, b) => a - b).join(' '));
    }
  }
}


		fs.writeFile( 
			outputFilename, 
			lines.join( '\n' ) + '\n',
			(e,d)=>{
				if (e) throw e;
				console.log( 'wrote', outputFilename );
			}
		);
	}

	nuonFile( outputFilename, mediapipe ) {
		const lines = [];

		for ( const point of mediapipe.landmarks ) {
			const line = 'v'.split( '' );
			for ( const [dimension,value] of Object.entries( point ) ) {
				line.push( value );
			}
			lines.push( line.join( ' ' ) );
		}

		if ( 0 != mediapipe.tesselation.length % 3 ) {
			throw new Error( `tesselation means mod 3, not ${mediapipe.tesselation.length}` );
		}

		const shared = new Map();

		for ( let i = 0 ; i < mediapipe.tesselation.length ; ) {
			const i0 = mediapipe.tesselation[ i++ ];
			const i1 = mediapipe.tesselation[ i++ ];
			const i2 = mediapipe.tesselation[ i++ ];

			if ( i0.end != i1.start || i1.end != i2.start || i2.end != i0.start ) {
				throw new Error( `bad tesselation: ${i0}, ${i1} and ${i2}` );
			}

			const v0 = i0.start + 1;
			const v1 = i1.start + 1;
			const v2 = i2.start + 1;
			const tri = [v0,v1,v2];
			const pairs = [
				[v0,v1],
				[v0,v2],
				[v1,v2]
			];

			for ( const pair of pairs  ) {
				const key = pair.map(a=>parseInt(a)).sort((a,b)=>a-b).join(' ' );
				if ( !shared.has( key ) ) shared.set( key, [] );
				shared.get( key ).push( tri );
			}
		}

		const sharedEdges = new Map();

		for (const [key, triangles] of shared.entries()) {
  const indices = key.split(' ').map(a => parseInt(a));

  if (triangles.length > 1) {
    for (const triangle of triangles) {
      const remainingVertices = triangle.filter(v => !indices.includes(v));
      const sharedKey = remainingVertices.sort((a, b) => a - b).join(' ');

      if (!sharedEdges.has(sharedKey)) {
        sharedEdges.set(sharedKey, []);
      }

      sharedEdges.get(sharedKey).push(triangle);
    }
  }
}

		//console.table( Object.fromEntries( shared ) );
		for (const [key, triangles] of sharedEdges.entries() ) {//shared.entries()) {
			const indices = key.split(' ').map(a => parseInt(a));
			if (triangles.length === 1) {
				// Only one triangle, print it
				lines.push( 'f ' + triangles[0].join( ' ' ) );
				//console.log('Triangle:', triangles[0]);
			} else if (triangles.length === 2) {
				// Two triangles, form a quad
				const quad = [...triangles[0], ...triangles[1].filter(v => !indices.includes(v))];
				lines.push( 'f ' + quad.join( ' ' ) );
				//console.log('Quad:', quad);
			} else {
				// More than two triangles, throw an error
				//throw new Error(`Invalid number of triangles (${triangles.length}) for shared edge: ${key}`);
				console.error(`Invalid number of triangles (${triangles.length}) for shared edge: ${key}`);

				triangles.forEach( triangle => lines.push( 'f ' + triangle.join( ' ' ) ) );
			}
		}

		fs.writeFile( 
			outputFilename, 
			lines.join( '\n' ) + '\n',
			(e,d)=>{
				if (e) throw e;
				console.log( 'wrote', outputFilename );
			}
		);
	}

	ogonFile( outputFilename, mediapipe ) {
		const lines = [];

		const points = [];
		const minValues = new Array( 3 ).fill( +Infinity );
		const maxValues = new Array( 3 ).fill( -Infinity );

		for ( const point of mediapipe.landmarks ) {
			const nu = [];
			points.push( nu );
			for ( const [dimension,value] of Object.entries( point ) ) {
				const i = 'xyz'.indexOf( dimension );
				const v = dimension ? -value : + value;
				minValues[ i ] = Math.min( minValues[ i ], v );
				maxValues[ i ] = Math.max( maxValues[ i ], v );
				nu.push( v );
			}
		}

		const midValues = maxValues.map( (v,i) => ( v + minValues[ x ] ) / 2 );
	
		for ( const point of points ) {
			lines.push( 'v ' + point.map((v,i)=>v-midValues[i]).join( ' ' ) );
		}

		if ( 0 != mediapipe.tesselation.length % 3 ) {
			throw new Error( `tesselation means mod 3, not ${mediapipe.tesselation.length}` );
		}

		for ( let i = 0 ; i < mediapipe.tesselation.length ; ) {
			const i0 = mediapipe.tesselation[ i++ ];
			const i1 = mediapipe.tesselation[ i++ ];
			const i2 = mediapipe.tesselation[ i++ ];

			if ( i0.end != i1.start || i1.end != i2.start || i2.end != i0.start ) {
				throw new Error( `bad tesselation: ${i0}, ${i1} and ${i2}` );
			}
			const line = ['f', i0.start+1, i1.start+1, i2.start+1 ];
			lines.push( line.join( ' ' ) );
		}

		fs.writeFile( 
			outputFilename, 
			lines.join( '\n' ) + '\n',
			(e,d)=>{
				if (e) throw e;
				console.log( 'wrote', outputFilename );
			}
		);
	}
};

new landMarkToObj().main( process.argv.slice( 2 ) );
