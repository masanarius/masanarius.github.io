from PIL import Image

output_file_name = [
    'masanari_ichikawa_qr.jpg',
    'masanari_ichikawa_jp.jpg',
    'masanari_ichikawa_en.jpg',
    'masanari_ichikawa_tel_qr.jpg',
    'masanari_ichikawa_tel_jp.jpg',
    'masanari_ichikawa_tel_en.jpg'
]

for i in range(1,6):
    org_file_name = 'Slide' + str(i) + '.jpeg'
    im = Image.open('businesscard_original/'+ org_file_name)
    im_rotate = im.rotate(-90, expand=True)
    im_rotate.save('businesscard/'+output_file_name[i-1])

