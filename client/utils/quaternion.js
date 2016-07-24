const degtorad = Math.PI / 180;

export function getQuaternion(alpha, beta, gamma) {
    let _x = beta ? beta * degtorad : 0;
    let _y = gamma ? gamma * degtorad : 0;
    let _z = alpha ? alpha * degtorad : 0;

    let cx = Math.cos( _x / 2 );
    let cy = Math.cos( _y / 2 );
    let cz = Math.cos( _z / 2 );

    let sx = Math.sin( _x / 2 );
    let sy = Math.sin( _y / 2 );
    let sz = Math.sin( _z / 2 );

    let w = cx * cy * cz - sx * sy * sz;
    let x = sx * cy * cz - cx * sy * sz;
    let y = cx * sy * cz + sx * cy * sz;
    let z = cx * cy * sz + sx * sy * cz;

    return getAcQuaternion(w, x, y, z);
}

function getAcQuaternion(_w, _x, _y, _z) {
    let angle = 2 * Math.acos(_w) / degtorad;

    let x = _x / Math.sin(degtorad * angle/ 2) || 0;
    let y = _y / Math.sin(degtorad * angle/ 2) || 0;
    let z = _z / Math.sin(degtorad * angle/ 2) || 0;

    return { x, y, z, angle};
}
