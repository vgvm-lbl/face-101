const rollingAverage = (obj, current) => {
	const size = 33;

	current = Math.max( 0, current ); /// ffsk
/*
	current = parseFloat( current.toFixed( 4 ) );
	if ( !( new Set( obj.values ) ).has( current ) ) {
		obj.values.unshift( obj.current = current );
	}
*/
	obj.current = current;
	if ( !obj.values.length || Math.abs( current - obj.values[ 0 ] ) > .001 ) {
		obj.values.unshift( current );
	}

	obj.values = obj.values.slice( 0, size );

	if ( 1 == obj.values.length ) {
		obj.min = obj.max = obj.current = current;
		return obj;
	}

	obj.min = obj.values.reduce( (m,v) => Math.min(m,v), +Infinity );
	obj.max = obj.values.reduce( (m,v) => Math.max(m,v), -Infinity );

	const diff = obj.max - obj.min; 
	obj.scaled = (current - obj.min) / diff;
	if ( isNaN( obj.scaled ) ) 
		throw new Error( `dammit, ${JSON.stringify( obj )}` );
	if ( obj.scaled < 0 ) throw new Error([ 'ffsk', obj.scaled, 'from',current, 'diff',diff, 'and', obj.min, obj.max ].join( ' ' ));
	return obj;
}
