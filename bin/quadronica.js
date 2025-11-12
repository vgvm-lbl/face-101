#!/usr/bin/env node 

const fs = require( 'fs' );

class quadronica {
	constructor() {
	}

	main( args ) {
		if ( 2 != args.length ) {
			throw new Error( 'usage: quadronica reference.obj remesh.obj' );
		}


		const references = this.pointed( this.lineMe( args[ 0 ] ) );

		const lines = this.lineMe( args[ 1 ] );
		const points = this.pointed( lines );

		console.error( references.length, 'and', points.length );

		const matches = new Map();
		const translate = new Map();

		for ( let i = 0 ; i < points.length ; i++ ) {
			const point = points[ i ];

			let closest = Infinity;
			let best = null
			let bestAt = -1;

			for ( let j = 0 ; j < references.length ; j++ ) {
				const reference = references[ j ];
				const diff = reference.reduce( (s,v,k)=> s + Math.pow( v - point[ k ], 2 ), 0 );
				if ( diff > closest ) continue;

				closest = diff;
				best = reference;
				bestAt = j;
			}
			//console.log( i, bestAt,closest, point, best );

			if ( !matches.has( bestAt ) ) matches.set( bestAt, [] );
			matches.get( bestAt ).push( i );

			translate.set( i + 1, bestAt + 1 ); // super lazy
		}

		matches.forEach((value, key) => {
			if (value.length > 1) {
				console.error(`warning: Key: ${key}, Values: ${value}`);
			}
		});

		const faces = lines
			.filter( s => /^f\s+/.test( s ) )
			.map( 
				s => s
					.replace( /^f\s+/, '' )
					.replace( /\/\/\d+/g, '' )
					.split( ' ' )
					.map( i => translate.get( parseInt( i ) ) )
			)
		;
		console.log( JSON.stringify(faces) );


	}

	lineMe( filename ) {
		return fs.readFileSync( filename ).toString().trim().split( '\n' );
   	}

	pointed( lines ) {
		return lines
			.filter( s => /^v\s+/.test( s ) )
			.map( s => s.replace( /^v\s+/, '' ).split( ' ' ).map( s => parseFloat( s ) ) );
	}

};

new quadronica().main( process.argv.slice( 2 ) );
