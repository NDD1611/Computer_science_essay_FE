
let nfa = {
    'states': [
        '3f484030-96e6-4c56-8188-41a04e154a2d',
        '7febe451-3f31-4bd1-b4ef-fae8a2225d8d',
        '1f04450d-a7ed-4a5d-ac29-be5726cd1b0e',
        'e9fa07e3-0e59-4fd4-9cc2-26e695dc8813',
        'ce82edca-6d5b-46a2-82e9-6f61b123f1f7',
        'd4f10229-3ca2-457e-9237-aa154d12cd43',
        'e200b890-9e58-461e-ac96-61a585e67114',
        '4da10d69-f347-4994-a5b2-0a55994d853f',
        '69166393-d425-4355-947b-fe736f9653a6'
    ],
    'initial_state': '3f484030-96e6-4c56-8188-41a04e154a2d',
    'final_states': [
        'e200b890-9e58-461e-ac96-61a585e67114',
        '69166393-d425-4355-947b-fe736f9653a6'
    ],
    'alphabets': ['$', '0', '1'],
    'transition_function': {
        '3f484030-96e6-4c56-8188-41a04e154a2d': {
            '$': [
                '7febe451-3f31-4bd1-b4ef-fae8a2225d8d',
                '4da10d69-f347-4994-a5b2-0a55994d853f'
            ],
            '0': [],
            '1': []
        },
        '7febe451-3f31-4bd1-b4ef-fae8a2225d8d': {
            '0': [
                '1f04450d-a7ed-4a5d-ac29-be5726cd1b0e'
            ],
            '1': [],
            '$': []
        },
        '1f04450d-a7ed-4a5d-ac29-be5726cd1b0e': {
            '0': [],
            '1': [],
            '$': ['e9fa07e3-0e59-4fd4-9cc2-26e695dc8813']
        },
        'e9fa07e3-0e59-4fd4-9cc2-26e695dc8813': {
            '0': [],
            '1': [],
            '$': [
                'ce82edca-6d5b-46a2-82e9-6f61b123f1f7',
                'e200b890-9e58-461e-ac96-61a585e67114'
            ]
        },
        'ce82edca-6d5b-46a2-82e9-6f61b123f1f7': {
            '0': [],
            '1': [
                'd4f10229-3ca2-457e-9237-aa154d12cd43'
            ],
            '$': []
        }, 'd4f10229-3ca2-457e-9237-aa154d12cd43': {
            '0': [],
            '1': [],
            '$': [
                'ce82edca-6d5b-46a2-82e9-6f61b123f1f7',
                'e200b890-9e58-461e-ac96-61a585e67114']
        },
        'e200b890-9e58-461e-ac96-61a585e67114': {
            '0': [],
            '1': [],
            '$': []
        },
        '4da10d69-f347-4994-a5b2-0a55994d853f': {
            '0': [],
            '1': [
                '69166393-d425-4355-947b-fe736f9653a6'
            ],
            '$': []
        },
        '69166393-d425-4355-947b-fe736f9653a6': {
            '0': [],
            '1': [],
            '$': []
        }
    }
}