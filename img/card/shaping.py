from PIL import Image

output_file_name = [
    'mail_qr.jpg',
    'mail_jp.jpg',
    'mail_en.jpg',
    'tel_qr.jpg',
    'tel_jp.jpg',
    'tel_en.jpg'
]

for i in range(1,7):
    org_file_name = 'Slide' + str(i) + '.jpeg'
    print(org_file_name + ' is found')
    im = Image.open('businesscard_original/'+ org_file_name)
    im_rotate = im.rotate(-90, expand=True)
    im_rotate.save('businesscard/'+output_file_name[i-1])
    print(org_file_name + ' is saved as ' + output_file_name[i-1])

im = Image.open('businesscard_original/Slide5.jpeg')
im.save('businesscard/sample.jpg')
print('sample.jpg saved')



