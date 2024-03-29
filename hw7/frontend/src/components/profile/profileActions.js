import Action, { updateError, updateSuccess, resource } from '../../actions'

export function validateProfile({username, email, phone, zipcode, password, pwconf}) {
    if (username) {
        if (!username.match('^[a-zA-Z][a-zA-Z0-9]+')) {
            return 'Invalid username.  Must start with a letter and can only contains letters and numbers.'
        }
    }

    if (email) {
        if (!email.match('^[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z][a-zA-Z]+$')) {
            return 'Invalid email.  Must be like a@b.co'
        }
    }

    if (phone) {
        if (!phone.match('^\[0-9]{3}[-]?\[0-9]{3}[-]?\[0-9]{4}$')) {
            return 'Invalid phone.  Must be like 123-123-1234'
        }
    }

    if (zipcode) {
        if (!zipcode.match('^[0-9]{5}$')) {
            return 'Invalid zipcode.  Must be 5 digits in length, e.g., 77005'
        }
    }

    if (password || pwconf) {
        if (password !== pwconf) {
            return 'Password do not match'
        }
    }

    return ''
}

export function updateHeadline(headline) {
    return (dispatch) => {
        dispatch(updateField('headline', headline))
    }
}

export function updateProfile({email, zipcode, password, pwconf}) {
    return (dispatch) => {
        const err = validateProfile({email, zipcode, password, pwconf})
        if (err.length > 0) {
            return dispatch(updateError(err))
        }
        dispatch(updateField('email', email))
        dispatch(updateField('zipcode', zipcode))
        dispatch(updateField('password', password))
    }
}

export function fetchProfile() {
    return (dispatch) => {
        dispatch(fetchField('avatars'))
        dispatch(fetchField('zipcode'))
        dispatch(fetchField('dob'))
        dispatch(fetchField('email'))
    }
}

function updateField(field, value) {
    return (dispatch) => {
        if (value) {
            const payload = {}
            payload[field] = value
            resource('PUT', field, payload).then((response) => {
                const action = { type: Action.UPDATE_PROFILE }                
                action[field] = response[field]
                if (field == 'password')
                    dispatch(updateSuccess('Successfully change the password!'))
                else
                    dispatch(action)
            })
        }
    }
}

function fetchField(field) {
    return (dispatch) => {
        resource('GET', field).then((response) => {
            const action = { type: Action.UPDATE_PROFILE }
            switch(field) {
                case 'avatars':
                    action.avatar = response.avatars[0].avatar; break;
                case 'email':
                    action.email = response.email; break;
                case 'dob':
                    action.dob = response.dob; break;
                case 'zipcode':
                    action.zipcode = response.zipcode; break;
            }
            dispatch(action)
        })
    }
}

export function uploadImage(file) {
    return (dispatch) => {
        if (file) {
            const fd = new FormData()
            fd.append('image', file)
            resource('PUT', 'avatar', fd, false)
            .then((response) => {
                dispatch({ type: Action.UPDATE_PROFILE, avatar: response.avatar })
            })
        }
    }
}

export function linkAccountFun({regUsername, regPassword}) {
    return (dispatch) => {
        if(regUsername && regPassword){
            resource('POST', 'merge', {regUsername, regPassword})
            .then((response) => {
                dispatch(updateSuccess(`You have successfuly linked with ${regUsername}`))
            }).catch((err) => {
                dispatch(updateError(`There was an error linking with ${regUsername}`))
            })
        }
    }
}

export function unlinkAccount(company) {
    return (dispatch) => {
        resource('POST', 'unlink', {company: company}).then((response) => {
            dispatch(updateSuccess('You have successfuly unlinked with third party account'))
        }).catch((err) => {
            dispatch(updateError('There was an error unlinking third party account'))
        })
    }
}

export function linkFacebook() {
    return (dispatch) => {
        window.top.location = 'https://dhbookhw8.herokuapp.com/link/facebook'
        dispatch(navToProfile())
    }
}