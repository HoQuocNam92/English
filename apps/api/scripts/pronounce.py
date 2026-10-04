"""Render English speech as WAV using the host's eSpeak NG library."""
import ctypes
import ctypes.util
import io
import sys
import wave

engine = ctypes.CDLL(ctypes.util.find_library('espeak-ng') or 'libespeak-ng.so.1')
engine.espeak_Initialize.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_char_p, ctypes.c_int]
engine.espeak_Initialize.restype = ctypes.c_int
rate = engine.espeak_Initialize(2, 0, None, 0)
if rate <= 0:
    raise RuntimeError('Speech engine initialization failed')
chunks = []
callback_type = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
@callback_type
def collect(samples, count, events):
    if samples and count > 0:
        chunks.append(ctypes.string_at(samples, count * 2))
    return 0
engine.espeak_SetSynthCallback.argtypes = [callback_type]
engine.espeak_SetSynthCallback(collect)
engine.espeak_SetVoiceByName.argtypes = [ctypes.c_char_p]
if engine.espeak_SetVoiceByName(b'en-us') != 0:
    raise RuntimeError('English voice unavailable')
engine.espeak_SetParameter(1, 150, 0)
text = sys.argv[1].encode('utf-8')
engine.espeak_Synth.argtypes = [ctypes.c_void_p, ctypes.c_size_t, ctypes.c_uint, ctypes.c_int, ctypes.c_uint, ctypes.c_uint, ctypes.c_void_p, ctypes.c_void_p]
if engine.espeak_Synth(text, len(text) + 1, 0, 1, 0, 1, None, None) != 0:
    raise RuntimeError('Speech synthesis failed')
engine.espeak_Synchronize()
engine.espeak_Terminate()
if not chunks:
    raise RuntimeError('Empty speech')
out = io.BytesIO()
with wave.open(out, 'wb') as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(rate)
    wav.writeframes(b''.join(chunks))
sys.stdout.buffer.write(out.getvalue())
