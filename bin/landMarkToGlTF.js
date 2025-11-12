#!/usr/bin/env node 

const fs = require( 'fs' );


/*


   output
   {
  "asset": {
    "version": "2.0"
  },
  "scene": {
    "nodes": [
      {
        "mesh": {
          "primitives": [
            {
              "attributes": {
                "POSITION": {
                  "type": "VEC3",
                  "values": [
                    -1.0, -1.0, 0.0,
                    1.0, -1.0, 0.0,
                    1.0, 1.0, 0.0,
                    -1.0, 1.0, 0.0
                  ]
                }
              },
              "indices": [
                0, 1, 2,
                2, 3, 0
              ]
            }
          ]
        }
      }
    ]
  }
}



*/

class landMarkToGlTF {
	constructor() {
	}

	main( args ) {
		if ( 1 != args.length ) {
			throw new Error( 'usage: landMarkToGlTF <mediapipe.json>' );
		}
		const filename = args[ 0 ];
		return fs.readFile( filename, 'utf-8', (e,d)=>{
			if ( e ) throw e;
			this.onFile( filename, JSON.parse( d ) );
		});
	}

	onFile( filename, mediapipe ) {
		const outputFilename = filename.replace( /.*\//, '' ).replace( /\.json$/, '.glTF' );
		if ( outputFilename === filename ) {
			throw new Error( `input filename needs to end with .json, yo, not like ${filename}` );
		}

		const gltf = this.blank();
		const primitive = gltf.scene.nodes[ 0 ].mesh.primitives[ 0 ];
		const vertices = primitive.attributes.POSITION.values;
		const faces = primitive.indices;

		for ( const point of mediapipe.landmarks ) {
			for ( const [dimension,value] of Object.entries( point ) ) {
				vertices.push( value );
			}
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

			faces.push( i0.start );
			faces.push( i1.start );
			faces.push( i2.start );
		}

		fs.writeFile( 
			outputFilename, 
			JSON.stringify(gltf,null,'\t') + '\n', 
			(e,d)=>{
				if (e) throw e;
				console.log( 'wrote', outputFilename );
			}
		);
	}

	blank() {
		return {
			"asset": {
				"version": "2.0"
			},
			"scene": {
				"nodes": [
					{
						"mesh": {
							"primitives": [
								{
									"attributes": {
										"POSITION": {
											"type": "VEC3",
											"values": []
										}
									},
									"indices": []
								}
							]
						}
					}
				]
			}
		}

	}
};

new landMarkToGlTF().main( process.argv.slice( 2 ) );
