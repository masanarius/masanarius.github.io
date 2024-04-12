from PIL import Image

output_file_name = [
    'masanari_ichikawa_qr.jpg',
    'masanari_ichikawa_jp.jpg',
    'masanari_ichikawa_en.jpg'
]

for i in range(1,4):
    org_file_name = 'スライド' + str(i) + '.jpeg'
    print(org_file_name + ' is found')
    im = Image.open('businesscard_original/'+ org_file_name)
    im_rotate = im.rotate(-90, expand=True)
    im_rotate.save('businesscard/'+output_file_name[i-1])
    print(org_file_name + ' is saved as ' + output_file_name[i-1])

im = Image.open('businesscard_original/スライド2.jpeg')
im.save('businesscard/sample.jpg')
print('sample.jpg saved')



